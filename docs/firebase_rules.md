# Regras de Segurança e Estrutura do Firestore (Fase 1)

Este documento descreve as regras de segurança e a estrutura necessárias no Firebase Firestore para suportar o compartilhamento de campanhas, diário e entidades.

---

## 1. Estrutura de Documentos no Firestore

### `/users/{userId}` (Coleção de Perfis)
Esta coleção armazena perfis públicos de usuários para permitir que um Mestre busque por e-mail e encontre o `UID` correspondente para compartilhar a campanha.

```json
{
  "email": "jogador@exemplo.com",
  "displayName": "Nome do Jogador",
  "photoURL": "https://lh3.googleusercontent.com/..."
}
```

### `/campaigns/{campaignId}` (Coleção de Campanhas)
Coleção principal no nível raiz. Cada campanha contém subcoleções para Diários, Personagens e Lugares.

```json
{
  "id": 1623849182371,
  "name": "Crônicas de Escuridão",
  "system": "Vampiro: A Máscara",
  "genre": "Gótico",
  "ownerId": "UID_DO_MESTRE_123",
  "collaborators": [
    "UID_DO_JOGADOR_456",
    "UID_DO_JOGADOR_789"
  ]
}
```

#### `/campaigns/{campaignId}/entries/{entryId}` (Diário)
```json
{
  "id": 1623849204859,
  "campaign_id": 1623849182371,
  "title": "Ataque no Beco",
  "content": "{\"ops\":[{\"insert\":\"Texto formatado do diário...\"}]}",
  "creation_date": "2026-06-16T18:00:00.000Z",
  "shared": true,
  "authorId": "UID_DO_JOGADOR_456"
}
```

#### `/campaigns/{campaignId}/characters/{charId}` (Personagens)
```json
{
  "id": 1623849215968,
  "campaign_id": 1623849182371,
  "name": "Drácula",
  "race": "Vampiro",
  "status": "Vivo",
  "shared": false
}
```

#### `/campaigns/{campaignId}/locations/{locId}` (Lugares)
```json
{
  "id": 1623849226105,
  "campaign_id": 1623849182371,
  "name": "Castelo das Sombras",
  "shared": true
}
```

---

## 2. Regras de Segurança (Security Rules) do Firestore

Copie e cole estas regras no seu console do Firebase (Firestore Database > Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper: Verifica se o usuário está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper: Busca os dados da campanha no Firestore
    function getCampaignData(campaignId) {
      return get(/databases/$(database)/documents/campaigns/$(campaignId)).data;
    }
    
    // Helper: Verifica se o usuário é o dono da campanha (Mestre)
    function isCampaignOwner(campaignId) {
      return isAuthenticated() && getCampaignData(campaignId).ownerId == request.auth.uid;
    }
    
    // Helper: Verifica se o usuário é membro da campanha (Mestre ou Colaborador)
    function isCampaignMember(campaignId) {
      return isAuthenticated() && (
        getCampaignData(campaignId).ownerId == request.auth.uid || 
        request.auth.uid in getCampaignData(campaignId).collaborators
      );
    }

    // Regras para Perfis de Usuários
    match /users/{userId} {
      // Qualquer usuário autenticado pode ler os perfis para buscar outros por e-mail/ID
      allow read: if isAuthenticated();
      // Apenas o próprio dono do perfil pode editar seus dados
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }

    // Regras para Campanhas
    match /campaigns/{campaignId} {
      // Leitura permitida para Mestre ou Jogadores da campanha
      allow read: if isAuthenticated() && (
        resource.data.ownerId == request.auth.uid || 
        request.auth.uid in resource.data.collaborators
      );
      
      // Criação permitida para qualquer usuário autenticado
      allow create: if isAuthenticated();
      
      // Modificação ou Exclusão permitida apenas para o dono (Mestre) da campanha
      allow update, delete: if isAuthenticated() && resource.data.ownerId == request.auth.uid;

      // Subcoleção: Diários (Entries)
      match /entries/{entryId} {
        // Leitura: Mestre lê tudo. Jogador lê apenas se a nota for compartilhada ou se ele for o autor da nota.
        allow read: if isCampaignMember(campaignId) && (
          resource.data.shared == true || 
          resource.data.authorId == request.auth.uid ||
          isCampaignOwner(campaignId)
        );
        // Criação: Qualquer membro (Mestre ou Jogador) da campanha pode criar notas.
        allow create: if isCampaignMember(campaignId);
        // Atualização/Exclusão: Apenas o autor original ou o Mestre podem alterar/deletar a nota.
        allow update, delete: if isCampaignMember(campaignId) && (
          resource.data.authorId == request.auth.uid ||
          isCampaignOwner(campaignId)
        );
      }

      // Subcoleção: Personagens (Characters)
      match /characters/{charId} {
        // Leitura: Mestre lê tudo. Jogador lê apenas se estiver marcado como compartilhado (shared == true).
        allow read: if isCampaignMember(campaignId) && (
          resource.data.shared == true || 
          isCampaignOwner(campaignId)
        );
        // Criação/Edição/Deleção: Apenas o Mestre pode manipular personagens por padrão.
        // (Você pode afrouxar isso se quiser que os jogadores criem personagens)
        allow write: if isCampaignOwner(campaignId);
      }

      // Subcoleção: Lugares (Locations)
      match /locations/{locId} {
        // Leitura: Mestre lê tudo. Jogador lê apenas se compartilhado.
        allow read: if isCampaignMember(campaignId) && (
          resource.data.shared == true || 
          isCampaignOwner(campaignId)
        );
        // Criação/Edição/Deleção: Apenas o Mestre
        allow write: if isCampaignOwner(campaignId);
      }
    }
  }
}
```
