
import { Category } from "@/types/prompt";

export const quality: Category[] = [
  {
    id: "details",
    name: "Details & Elements",
    description: "Additional details and elements in the image",
    options: [
      { id: "reflections", name: "Reflections", value: "reflections" },
      { id: "shadows", name: "Shadows", value: "detailed shadows" },
      { id: "texture", name: "Texture", value: "detailed texture" },
      { id: "particles", name: "Particles", value: "particles" },
      { id: "fog", name: "Fog/Mist", value: "fog" },
      { id: "smoke", name: "Smoke", value: "smoke" },
      { id: "rain", name: "Rain", value: "rain" },
      { id: "snow", name: "Snow", value: "snow" },
      { id: "bubbles", name: "Bubbles", value: "bubbles" },
      { id: "glitter", name: "Glitter", value: "glitter" },
      { id: "feathers", name: "Feathers", value: "feathers" },
      { id: "flowers", name: "Flowers", value: "flowers" },
      { id: "fire", name: "Fire", value: "fire" },
      { id: "water", name: "Water", value: "water" },
      { id: "floating", name: "Floating Elements", value: "floating elements" },
      { id: "glowing", name: "Glowing Elements", value: "glowing elements" },
    ]
  },
  {
    id: "quality",
    name: "Quality & Render",
    description: "Technical aspects of the image quality",
    options: [
      { id: "high-res", name: "High Resolution", value: "high resolution" },
      { id: "8k", name: "8K", value: "8K" },
      { id: "sharp", name: "Sharp Details", value: "sharp details" },
      { id: "grainy", name: "Film Grain", value: "film grain" },
      { id: "smooth", name: "Smooth Rendering", value: "smooth rendering" },
      { id: "ray-tracing", name: "Ray Tracing", value: "ray tracing" },
      { id: "volumetric", name: "Volumetric Lighting", value: "volumetric lighting" },
      { id: "octane", name: "Octane Render", value: "octane render" },
      { id: "unreal-engine", name: "Unreal Engine", value: "unreal engine" },
      { id: "vray", name: "V-Ray", value: "v-ray" },
      { id: "highly-detailed", name: "Highly Detailed", value: "highly detailed" },
      { id: "award-winning", name: "Award-Winning", value: "award-winning" },
      { id: "studio-quality", name: "Studio Quality", value: "studio quality" },
      { id: "professional", name: "Professional", value: "professional" },
      { id: "trending", name: "Trending on ArtStation", value: "trending on artstation" },
      { id: "hdr", name: "HDR", value: "HDR rendering" },
      { id: "4k", name: "4K", value: "4K resolution" },
      { id: "cinematic", name: "Cinematic", value: "cinematic" },
      { id: "photorealistic", name: "Photorealistic", value: "photorealistic rendering" },
      { id: "hyperrealistic", name: "Hyperrealistic", value: "hyperrealistic" },
      { id: "realistic-texture", name: "Realistic Texture", value: "realistic texture" },
      { id: "anti-aliasing", name: "Anti-Aliasing", value: "anti-aliasing" },
      { id: "ambient-occlusion", name: "Ambient Occlusion", value: "ambient occlusion" },
      { id: "subsurface-scattering", name: "Subsurface Scattering", value: "subsurface scattering" },
    ]
  },
];
