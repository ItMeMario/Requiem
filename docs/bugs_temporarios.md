# Relatório Temporário de Bugs - Requiem

Este documento reúne os bugs identificados na versão atual do Requiem para triagem, investigação e correção passo a passo.

---

## 📌 Sumário dos Erros

| ID | Título | Ambiente | Severidade | Status |
|---|---|---|---|---|
| **BUG-01** | Sincronização de dados em campanhas compartilhadas | Mobile | Alta | ✅ Corrigido (Etapas 1 a 4 Concluídas) |
| **BUG-02** | Jogador atribuído não consegue editar/salvar entidades | Mobile e Desktop | Alta | 🔍 Identificado / Em análise |

---

## 🐛 BUG-01: Sincronização de Dados de Campanha Compartilhada

### 1. Descrição do Problema
Ao compartilhar uma campanha com outro jogador, a conta do jogador no aplicativo **Mobile** não carrega os dados já existentes na campanha (como NPCs/Personagens, Lugares, Diários, etc.).

### 2. Onde foi encontrado
- **Mobile** (Android / Capacitor)
- *Nota:* O mesmo comportamento **não** ocorre no Desktop.

### 3. Como reproduzir
1. No Desktop (ou dispositivo do Mestre), crie uma campanha contendo NPCs, Lugares ou Diários.
2. Adicione um jogador como colaborador utilizando o e-mail cadastrado dele.
3. No dispositivo **Mobile**, faça login com a conta do jogador convidado.
4. Abra a campanha compartilhada.
5. **Resultado observado:** As abas de Personagens, Lugares e Diários aparecem vazias ou não carregam os registros existentes.

### 4. Análise Técnica Inicial e Pontos de Investigação
- **Reset de compartilhamento ao convidar colaboradores:**
  Em [`firebaseDataService.ts`](file:///c:/Users/nigtm/Documents/Github/Requiem/src/renderer/services/firebaseDataService.ts#L646-L678), ao adicionar o primeiro colaborador via `addCollaborator`, o método `resetCampaignItemsSharing` é disparado, alterando em lote todos os itens da campanha para `shared: false`:
  ```typescript
  if (collaborators.length === 0) {
    await this.resetCampaignItemsSharing(campaignId);
  }
  ```
  Se os itens foram marcados como privados (`shared: false`) e não estão explicitamente atribuídos ao jogador, a consulta do colaborador (`where('shared', '==', true)`) não retorna nada.
- **Tratamento de erros silencioso em subscrições:**
  Em [`useEntities.ts`](file:///c:/Users/nigtm/Documents/Github/Requiem/src/renderer/hooks/useEntities.ts#L19-L49), o hook não passa um callback `onError` para `subscribeCharacters`, `subscribeLocations` e `subscribeEntries`. Se o Firestore no mobile disparar um erro de índice composto ou de permissão, a tela permanece em estado vazio sem feedback visual.
- **Diferenças de inicialização de Auth / DataService no Mobile:**
  No mobile, o Firebase Auth pode demorar alguns milissegundos para restabelecer o token nativo do Capacitor. Se `getDataService()` em [`services/index.ts`](file:///c:/Users/nigtm/Documents/Github/Requiem/src/renderer/services/index.ts#L10-L33) for consultado antes de `auth.currentUser` estar preenchido, a instância cai no fallback `WebDataService` (banco SQLite local em memória/IndexedDB) em vez do `FirebaseDataService`.

---

## 🐛 BUG-02: Jogador com Atribuição Não Consegue Salvar Edições

### 1. Descrição do Problema
Quando o Mestre atribui uma entidade (NPC ou Lugar) a um jogador específico para conceder permissão de edição, o jogador ainda assim não consegue salvar alterações feitas na entidade.

### 2. Onde foi encontrado
- **Mobile** e **Desktop**

### 3. Como reproduzir
1. O Mestre cria ou edita um Personagem ou Lugar e o atribui a um jogador colaborador através do seletor `AssignPlayersSelect`.
2. O jogador entra com sua conta (em Desktop ou Mobile) e abre a entidade atribuída.
3. O jogador faz alterações em campos permitidos e clica no botão para salvar ("Save Character" / "Save Location").
4. **Resultado observado:** A alteração não é persistida, a operação falha ou a interface impede a gravação.

### 4. Análise Técnica Inicial e Pontos de Investigação
- **Regras de Segurança do Firestore (`firestore.rules`):**
  Em [`firestore.rules`](file:///c:/Users/nigtm/Documents/Github/Requiem/firestore.rules#L37-L43), a função auxiliar `assignedToNotModified()` valida:
  ```javascript
  function assignedToNotModified() {
    return (
      (!('assignedTo' in request.resource.data) && !('assignedTo' in resource.data)) ||
      (('assignedTo' in request.resource.data) && ('assignedTo' in resource.data) && request.resource.data.assignedTo == resource.data.assignedTo) ||
      (!('assignedTo' in resource.data) && ('assignedTo' in request.resource.data) && request.resource.data.assignedTo == [])
    );
  }
  ```
  - Comparações diretas de igualdade entre listas (`listA == listB` ou `list == []`) nas regras do Firestore podem falhar ou avaliar como falso se a ordem ou formato divergir, ou se o campo for nulo em vez de lista vazia.
  - A forma padrão e segura no Firestore Rules para impedir alteração de um campo específico é verificar `!('assignedTo' in request.resource.data.diff(resource.data).affectedKeys())`.
- **Validação de permissão e envio de payload no Client:**
  - Em [`firebaseDataService.ts`](file:///c:/Users/nigtm/Documents/Github/Requiem/src/renderer/services/firebaseDataService.ts#L450-L457) (`updateCharacter`) e [`L575-L578`](file:///c:/Users/nigtm/Documents/Github/Requiem/src/renderer/services/firebaseDataService.ts#L575-L578) (`updateLocation`), o código força `updateData.assignedTo = existing.assignedTo || []`. Se no documento original o campo `assignedTo` estava ausente ou nulo, enviar `[]` pode ser considerado uma mutação pelas regras de segurança.
  - Em [`CharacterModal.tsx`](file:///c:/Users/nigtm/Documents/Github/Requiem/src/renderer/components/modals/CharacterModal.tsx#L141), o seletor `AssignPlayersSelect` usa `disabled={!canEditCore}`. Como o jogador atribuído tem `canEditCore = true`, ele consegue interagir com o seletor de atribuição, o que violaria a regra de que colaboradores não podem alterar atribuições.
- **Resolução de Document Reference sem campanha:**
  Em [`firebaseDataService.ts`](file:///c:/Users/nigtm/Documents/Github/Requiem/src/renderer/services/firebaseDataService.ts#L43-L50), métodos como `getCharacterDocRef` recorrem a `findDocRef` (que usa `collectionGroup('characters')`) se `characterCampaignMap` não estiver carregado na memória. Como o `firestore.rules` não possui regras para consultas de collection group, o Firestore rejeita a operação com erro de permissão.

---

## 🎯 Próximos Passos Sugeridos

1. **Atacar o BUG-01 (Sincronização Mobile):**
   - Revisar o comportamento de `resetCampaignItemsSharing` ao adicionar colaboradores.
   - Garantir que o `auth.currentUser` esteja pronto antes de instanciar o serviço de dados no Mobile.
   - Adicionar tratamento de erro e logs visíveis no hook `useEntities`.
2. **Atacar o BUG-02 (Permissão de Edição para Jogador Atribuído):**
   - Ajustar `firestore.rules` usando `diff().affectedKeys()` para garantir que jogadores atribuídos possam salvar alterações de conteúdo sem falsos bloqueios.
   - Bloquear a edição de `assignedTo` na UI para não-mestres (`disabled={!isOwner}`).
   - Garantir que `campaign_id` seja sempre passado em `updateCharacter` e `updateLocation` para evitar chamadas a `collectionGroup`.
