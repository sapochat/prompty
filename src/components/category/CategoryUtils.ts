
import { Category } from "@/types/prompt";

export const groupCategories = (categories: Category[]) => {
  return [
    { 
      title: "Content", 
      items: categories.filter(c => [
        'subject', 
        'style', 
        'medium', 
        'artists', 
        'photographers', 
        'details', 
        'quality'
      ].includes(c.id)) 
    },
    { 
      title: "Character", 
      items: categories.filter(c => [
        'gender', 
        'bodyType', 
        'clothing', 
        'accessories', 
        'expression', 
        'pose', 
        'angle', 
        'hairStyle'
      ].includes(c.id)) 
    },
    { 
      title: "Style", 
      items: categories.filter(c => [
        'lighting', 
        'colors', 
        'mood', 
        'color_grading', 
        'composition', 
        'camera', 
        'camera_type'
      ].includes(c.id)) 
    },
    { 
      title: "Setting", 
      items: categories.filter(c => [
        'setting', 
        'era', 
        'place', 
        'weather', 
        'timeOfDay', 
        'season'
      ].includes(c.id)) 
    },
  ];
};

// Get default configuration
export const getDefaultConfig = () => {
  return {
    subject: [],
    style: [],
    medium: [],
    artists: [],
    lighting: [],
    mood: [],
    setting: [],
    colors: [],
    era: [],
    composition: [],
    camera: [],
    quality: [],
    photographers: [],
    details: [],
    gender: [],
    bodyType: [],
    clothing: [],
    accessories: [],
    expression: [],
    pose: [],
    angle: [],
    hairStyle: [],
    place: [],
    weather: [],
    timeOfDay: [],
    season: [],
    camera_type: [],
    color_grading: [],
    extraDetails: '',
    model: '',
  };
};
