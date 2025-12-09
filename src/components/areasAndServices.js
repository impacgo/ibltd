// src/data/areasAndServices.js
import image from "../images/bedding.webp";
import image2 from "../images/bedding.webp";
import image3 from "../images/bedding.webp";
import image4 from "../images/bedding.webp";
import image5 from "../images/bedding.webp";
import image6 from "../images/bedding.webp";
import image7 from "../images/bedding.webp";
import image8 from "../images/bedding.webp";

/**
 * Areas: name + slug + postcodes + short description
 */
export const AREAS = [
  { name: "Paddington", slug: "paddington", postcodes: ["W2"], desc: "Central London hub near Paddington Station" },
  { name: "Notting Hill", slug: "notting-hill", postcodes: ["W11"], desc: "Famous for Portobello Road Market" },
  { name: "Kensington", slug: "kensington", postcodes: ["W8","SW7"], desc: "Royal borough with museums & gardens" },
  { name: "Earls Court", slug: "earls-court", postcodes: ["SW5"], desc: "Residential area with exhibition center" },
  { name: "Chelsea", slug: "chelsea", postcodes: ["SW3","SW10"], desc: "Upscale area with King's Road" },
  { name: "Fulham", slug: "fulham", postcodes: ["SW6"], desc: "Riverside area with Fulham Palace" },
  { name: "Hammersmith", slug: "hammersmith", postcodes: ["W6"], desc: "Thames-side location with bridge" },
  { name: "Shepherds Bush", slug: "shepherds-bush", postcodes: ["W12","W14"], desc: "Home to Westfield shopping center" },
];

/**
 * Your services array (kept exactly as provided — images link to imported assets)
 */
export const SERVICES = [
  {
    id: 1,
    title: "Cloth Clean & Iron",
    slug: "cloth-clean-iron",
    description: "We professionally clean and press your clothes with care and precision.",
    image,
  },
  {
    id: 2,
    title: "Iron Only",
    slug: "iron-only",
    description: "Need just a perfect press? We iron everything to crisp, clean standards.",
    image: image2,
  },
  {
    id: 3,
    title: "Dry Cleaning",
    slug: "dry-cleaning",
    description: "Delicate dry cleaning for suits, dresses, and specialty items.",
    image: image3,
  },
  {
    id: 4,
    title: "Leather & Suede",
    slug: "leather-suede",
    description: "Careful cleaning for leather jackets, suede items, and more.",
    image: image4,
  },
  {
    id: 5,
    title: "Bedding & Household",
    slug: "bedding-household",
    description: "Comforters, bedsheets, curtains — all freshly washed.",
    image: image6,
  },
  {
    id: 6,
    title: "Shoes & Bags",
    slug: "shoes-bags",
    description: "Full care service for shoes, handbags, and accessories.",
    image: image5,
  },
  {
    id: 7,
    title: "Repair & Alteration",
    slug: "repair-alteration",
    description: "Stitching, hemming, zip repairs and clothing alterations.",
    image: image7,
  },
  {
    id: 8,
    title: "Service Wash",
    slug: "service-wash",
    description: "Drop your laundry — we wash, dry, and fold it for you.",
    image: image8,
  },
];
