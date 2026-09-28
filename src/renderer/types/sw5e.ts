export type Sw5eCategory = 'monsters' | 'species';

export interface Sw5eTrait {
  name: string;
  description: string;
}

export interface Sw5eBehavior {
  name: string;
  monsterBehaviorType: 'Trait' | 'Action' | 'Reaction' | 'Legendary' | string;
  description: string;
}

export interface Sw5eAbilityIncrease {
  abilities: string[];
  amount: number;
}

export interface Sw5eSpecies {
  name: string;
  flavorText?: string | null;
  skinColorOptions?: string | null;
  hairColorOptions?: string | null;
  eyeColorOptions?: string | null;
  distinctions?: string | null;
  heightAverage?: string | null;
  weightAverage?: string | null;
  homeworld?: string | null;
  language?: string | null;
  size: string;
  traits: Sw5eTrait[];
  abilitiesIncreased?: Sw5eAbilityIncrease[][] | null;
  imageUrls?: string[] | null;
}

export interface Sw5eMonster {
  name: string;
  flavorText?: string | null;
  sectionText?: string | null;
  size: string;
  types?: string[] | null;
  alignment?: string | null;
  armorClass: number;
  armorType?: string | null;
  hitPoints: number;
  hitPointRoll?: string | null;
  speed?: string | null;
  strength: number;
  strengthModifier: number;
  dexterity: number;
  dexterityModifier: number;
  constitution: number;
  constitutionModifier: number;
  intelligence: number;
  intelligenceModifier: number;
  wisdom: number;
  wisdomModifier: number;
  charisma: number;
  charismaModifier: number;
  savingThrows?: string[] | null;
  skills?: string[] | null;
  damageImmunities?: string[] | null;
  damageResistances?: string[] | null;
  damageVulnerabilities?: string[] | null;
  conditionImmunities?: string[] | null;
  senses?: string[] | null;
  languages?: string[] | null;
  challengeRating: string;
  experiencePoints?: number | null;
  behaviors?: Sw5eBehavior[] | null;
  imageUrls?: string[] | null;
}

export type Sw5eItem = Sw5eMonster | Sw5eSpecies;
