
import { Category } from "@/types/prompt";

export const examples: Category[] = [
  {
    id: "examples",
    name: "Example Templates",
    description: "Predefined templates you can use as starting points",
    options: [
      { 
        id: "portrait-example", 
        name: "Portrait Example", 
        value: "A portrait of a [person] in the style of [artist], with [lighting] and a [mood] atmosphere. The background shows a [setting] with [color] tones. The composition follows [composition], and the image is rendered in [quality]." 
      },
      { 
        id: "landscape-example", 
        name: "Landscape Example", 
        value: "A [landscape] scene in a [setting] environment, painted in the style of [artist]. The scene has [lighting] with [color] palette creating a [mood] atmosphere. The image uses [composition] composition and is rendered in [quality]." 
      },
      { 
        id: "concept-art-example", 
        name: "Concept Art Example", 
        value: "Concept art of a [subject] in a [setting] environment. The art style is inspired by [artist] with [color] tones and [lighting]. The scene conveys a [mood] atmosphere with [composition] composition. Rendered in [quality]." 
      },
      { 
        id: "fantasy-example", 
        name: "Fantasy Example", 
        value: "A fantasy [subject] in a [setting] world. The image is inspired by [artist] with [lighting] and [color] palette. The atmosphere is [mood] with [composition] composition. Rendered in [quality]." 
      },
      {
        id: "sci-fi-example",
        name: "Sci-Fi Example",
        value: "A futuristic [subject] in a [setting] environment. The style draws from [artist] with [lighting] and [color] color scheme. The atmosphere is [mood] with [composition] composition. Rendered in [quality] with fine details."
      },
      {
        id: "product-example",
        name: "Product Example",
        value: "A professional product photograph of a [subject] with [lighting] and [mood] presentation. The background is [setting] with [color] tones. The image uses [composition] composition and is rendered in [quality]."
      },
      {
        id: "street-photo-example",
        name: "Street Photography Example",
        value: "A street photograph of a [subject] in a [setting] environment. The photo has [lighting] with [color] tones creating a [mood] atmosphere. The composition follows [composition] and the image has [quality] details."
      },
      {
        id: "abstract-example",
        name: "Abstract Example",
        value: "An abstract representation of [subject] using [medium] techniques. The artwork is inspired by [artist] featuring [color] colors and [composition] composition. The piece evokes a [mood] feeling and is rendered with [quality]."
      },
      {
        id: "anime-example",
        name: "Anime Example",
        value: "An anime-style illustration of a [subject] in a [setting] scene. The artwork has [lighting] with [color] color palette creating a [mood] atmosphere. The style is inspired by [artist] with [composition] composition."
      },
      {
        id: "3d-render-example",
        name: "3D Render Example",
        value: "A 3D render of a [subject] in a [setting] environment. The scene has [lighting] with [color] palette. The mood is [mood] with [composition] composition. Rendered with [quality] using modern 3D techniques."
      },
      {
        id: "character-example",
        name: "Character Example",
        value: "A [character_traits] character in a [setting] environment. The artwork is in the style of [artist] with [lighting] and [color] palette. The mood is [mood] with [composition] composition. Rendered in [quality]."
      },
      {
        id: "wildlife-example",
        name: "Wildlife Example",
        value: "A wildlife photograph of a [subject] in its natural [setting] habitat. Shot with [camera] settings and [lighting], creating a [mood] atmosphere. The image uses [composition] composition and has [quality] details."
      }
    ]
  }
];
