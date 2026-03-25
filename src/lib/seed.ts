import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const sampleProjects = [
  {
    title: "Skyline Residency",
    description: "A premium 40-story residential complex featuring luxury apartments with panoramic city views, infinity pool, and state-of-the-art gym.",
    location: "Downtown Metropolis",
    type: "Residential",
    status: "Ongoing",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=2070",
    timeline: "2023 - 2026",
  },
  {
    title: "Grand Highway Expansion",
    description: "Major infrastructure project involving the expansion of the main arterial highway, including new interchanges and smart traffic management systems.",
    location: "Northern Corridor",
    type: "Roads",
    status: "Ongoing",
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=2070",
    timeline: "2024 - 2027",
  },
  {
    title: "TechHub Business Park",
    description: "A sustainable commercial development designed for modern tech companies, featuring open-plan offices, green roofs, and solar energy integration.",
    location: "Innovation District",
    type: "Commercial",
    status: "Completed",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2069",
    timeline: "2021 - 2024",
  },
  {
    title: "Riverfront Bridge",
    description: "An iconic suspension bridge connecting the east and west banks, designed with pedestrian walkways and architectural lighting.",
    location: "Riverside",
    type: "Infrastructure",
    status: "Completed",
    imageUrl: "https://images.unsplash.com/photo-1449156001935-d2863fb72690?auto=format&fit=crop&q=80&w=2070",
    timeline: "2020 - 2023",
  }
];

export const seedDatabase = async () => {
  const projectsCol = collection(db, 'projects');
  const snapshot = await getDocs(projectsCol);
  
  if (snapshot.empty) {
    console.log("Seeding database with sample projects...");
    for (const project of sampleProjects) {
      await addDoc(projectsCol, {
        ...project,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    console.log("Seeding complete!");
  }
};
