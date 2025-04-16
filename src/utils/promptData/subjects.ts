
import { Category } from "@/types/prompt";

export const subjects: Category[] = [
  {
    id: "subject",
    name: "Subject",
    description: "The main subject or focus of the image",
    options: [
      { id: "character", name: "Character", value: "character" },
      { id: "portrait", name: "Portrait", value: "portrait" },
      { id: "landscape", name: "Landscape", value: "landscape" },
      { id: "animal", name: "Animal", value: "animal" },
      { id: "object", name: "Object", value: "object" },
      { id: "concept", name: "Abstract Concept", value: "concept" },
      { id: "scene", name: "Scene", value: "scene" },
    ]
  },
  {
    id: "character_traits",
    name: "Character Traits",
    description: "Traits and characteristics for character-based prompts",
    options: [
      { id: "young", name: "Young", value: "young" },
      { id: "old", name: "Old", value: "old" },
      { id: "beautiful", name: "Beautiful", value: "beautiful" },
      { id: "handsome", name: "Handsome", value: "handsome" },
      { id: "rugged", name: "Rugged", value: "rugged" },
      { id: "elegant", name: "Elegant", value: "elegant" },
      { id: "strong", name: "Strong", value: "strong" },
      { id: "delicate", name: "Delicate", value: "delicate" },
      { id: "mysterious", name: "Mysterious", value: "mysterious" },
      { id: "friendly", name: "Friendly", value: "friendly" },
      { id: "warrior", name: "Warrior", value: "warrior" },
      { id: "royalty", name: "Royalty", value: "royalty" },
      { id: "wizard", name: "Wizard/Mage", value: "wizard" },
      { id: "explorer", name: "Explorer", value: "explorer" },
      { id: "cyborg", name: "Cyborg", value: "cyborg" },
      { id: "alien", name: "Alien", value: "alien" },
    ]
  },
];
