import { Course, EventItem } from './types';
import scratchMathsLearning from './assets/images/scratch_maths_learning_1780441786319.png';
import scratchMathsArt from './assets/images/scratch_maths_art_1780441801018.png';
import scratchMathsPeer from './assets/images/scratch_maths_peer_1780441816378.png';
import scratchMathsInterface from './assets/images/scratch_maths_interface_1780441832376.png';

import droneAssembly from './assets/images/drone_assembly_1780442981249.png';
import droneCodingPure from './assets/images/drone_coding_pure_1780443362735.png';
import droneFlight from './assets/images/drone_flight_1780443008643.png';
import dronePhysics from './assets/images/drone_physics_1780443022348.png';

import zmroboAssembly from './assets/images/zmrobo_assembly_1780443384038.png';
import zmroboSensor from './assets/images/zmrobo_sensor_1780443400305.png';
import zmroboProgramming from './assets/images/zmrobo_programming_1780443416555.png';
import zmroboMechanics from './assets/images/zmrobo_mechanics_1780443454422.png';

import hawgentDynamicGeometry from './assets/images/hawgent_dynamic_geometry_1780443868827.png';
import hawgentTrigonometry from './assets/images/hawgent_trigonometry_1780443884256.png';
import hawgentAlgebraBlocks from './assets/images/hawgent_algebra_blocks_1780443899111.png';
import hawgent3dProjection from './assets/images/hawgent_3d_projection_1780443911575.png';

import secmathsChalkboard from './assets/images/secmaths_chalkboard_1780444627246.png';
import secmathsPrecision from './assets/images/secmaths_precision_1780444643265.png';
import secmathsAcademic from './assets/images/secmaths_academic_1780444658617.png';
import secmathsHomework from './assets/images/secmaths_homework_1780444674614.png';

import aicoPromptDesign from './assets/images/aico_prompt_design_1780445344415.png';
import aicoStoryboard from './assets/images/aico_storyboard_1780445362724.png';
import aicoPrototype from './assets/images/aico_prototype_1780445376532.png';
import aico3dModelling from './assets/images/aico_3d_modelling_1780445391809.png';
import aicoCollaboration from './assets/images/aico_collaboration_1780446541477.png';
import aicoPlayPhysical from './assets/images/aico_play_physical_1780446864951.png';
import aicoHybridTrigger from './assets/images/secmaths_cryptography_1780444193400.png';

export const initialCourses: Course[] = [
  {
    id: 'scratchmaths',
    name: 'UCL ScratchMaths',
    nameZh: 'UCL ScratchMaths',
    source: 'UCL Knowledge Lab (University College London)',
    ageGroup: 'Ages 9-11 (Primary Years)',
    duration: '10-12 Weeks Course',
    keyConcepts: [
      'Geometry & Spatial Directions',
      'Algorithms & Iteration',
      'Variables & Coordinate Systems',
      'Pattern Copying and Scale'
    ],
    description: 'Developed by the world-class UCL Knowledge Lab, ScratchMaths links computer programming with Key Stage 2 mathematical content. Under YVIA peer mentors, students dive deep into the Scratch programming block syntax to explore geometry, symmetries, variables, and coordinate grids, shifting from passive screen users to creative mathematically minded programmers.',
    descriptionZh: 'Developed by the world-class UCL Knowledge Lab, ScratchMaths links computer programming with Key Stage 2 mathematical content. Under YVIA peer mentors, students dive deep into the Scratch programming block syntax to explore geometry, symmetries, variables, and coordinate grids, shifting from passive screen users to creative mathematically minded programmers.',
    images: [
      scratchMathsLearning,
      scratchMathsArt,
      scratchMathsPeer,
      scratchMathsInterface
    ],
    approved: true
  },
  {
    id: 'drone',
    name: 'Drone Robotics & Autonomous Control',
    nameZh: 'Drone Robotics & Autonomous Control',
    source: 'YVIA Applied STEM Curriculum',
    ageGroup: 'Ages 11-15 (Intermediate & High School)',
    duration: '8-10 Weeks Course',
    keyConcepts: [
      'Aerodynamics & Physics of Flight',
      'Autonomous Pilot Programming',
      'Coordinates in 3D Space',
      'Sensor Feedback & Telemetry'
    ],
    description: 'Our Drone program bridges the gap between software programming and physical mechanics. Moving beyond standard screen play, students assemble educational quadcopters, learn physical laws of lift, yaw, pitch, and roll, and write precise autonomous path scripts using Block-based languages and Python to navigate obstacle courses.',
    descriptionZh: 'Our Drone program bridges the gap between software programming and physical mechanics. Moving beyond standard screen play, students assemble educational quadcopters, learn physical laws of lift, yaw, pitch, and roll, and write precise autonomous path scripts using Block-based languages and Python to navigate obstacle courses.',
    images: [
      droneAssembly,
      droneCodingPure,
      droneFlight,
      dronePhysics
    ],
    approved: true
  },
  {
    id: 'zmrobo',
    name: 'ZMROBO Modular Intelligent Robotics',
    nameZh: 'ZMROBO Modular Intelligent Robotics',
    source: 'ZMROBO Education Ecosystem',
    ageGroup: 'Ages 8-13 (Junior STEM)',
    duration: '8-12 Weeks Course',
    keyConcepts: [
      'Sensory-Motor Control Loops',
      'Structural Engineering & Mechanics',
      'Conditional Logic & Branching',
      'Real-world Problem Solving'
    ],
    description: 'ZMROBO combines high-precision modular joints, complex gears, and interactive sensors with block programming. Students design, build, and program physical robot prototypes (e.g. intelligent sorters, line-trackers) to explore the basics of engineering design, tactile learning, and system logic.',
    descriptionZh: 'ZMROBO combines high-precision modular joints, complex gears, and interactive sensors with block programming. Students design, build, and program physical robot prototypes (e.g. intelligent sorters, line-trackers) to explore the basics of engineering design, tactile learning, and system logic.',
    images: [
      zmroboAssembly,
      zmroboSensor,
      zmroboProgramming,
      zmroboMechanics
    ],
    approved: true
  },
  {
    id: 'hawgent',
    name: 'Hawgent Dynamic Visual Mathematics',
    nameZh: 'Hawgent Dynamic Visual Mathematics',
    source: 'Hawgent Technology & Research Center',
    ageGroup: 'Ages 10-15 (Interactive Visuals)',
    duration: '6-8 Weeks Course',
    keyConcepts: [
      'Dynamic Geometric Models',
      'Visualizing Algebraic Formulae',
      '3D Coordinate Projections',
      'Interactive Functions & Tracing'
    ],
    description: 'Featuring Hawgent Maths professional visual-dynamic software suites, this course transforms static formulas and plane geometries into touchable, draggable interactive elements. Students develop intense geometric intuition and easily grasp algebraic equations by watching variables morph in real-time.',
    descriptionZh: 'Featuring Hawgent Maths professional visual-dynamic software suites, this course transforms static formulas and plane geometries into touchable, draggable interactive elements. Students develop intense geometric intuition and easily grasp algebraic equations by watching variables morph in real-time.',
    images: [
      hawgentDynamicGeometry,
      hawgentTrigonometry,
      hawgentAlgebraBlocks,
      hawgent3dProjection
    ],
    approved: true
  },
  {
    id: 'secondarymaths',
    name: 'Creative Middle & Secondary Mathematics',
    nameZh: 'Creative Middle & Secondary Mathematics',
    source: 'YVIA Deep Thinking Curriculum',
    ageGroup: 'Ages 12-16 (Middle School Maths)',
    duration: '10 Weeks Course',
    keyConcepts: [
      'Logical Deduction & Proof Writing',
      'Statistics, Probability & Data Science',
      'Calculus Intuitives & Infinite Series',
      'Cryptographic Functions & Game Theory'
    ],
    description: 'Specifically tailored for secondary levels, this course focuses on peer-led mathematical inquiry. Rather than rote homework drills, YVIA peer leaders guide students through mathematical beauties: visual proofs without words, real-world data analysis, introductory cryptography, and logical challenge design.',
    descriptionZh: 'Specifically tailored for secondary levels, this course focuses on peer-led mathematical inquiry. Rather than rote homework drills, YVIA peer leaders guide students through mathematical beauties: visual proofs without words, real-world data analysis, introductory cryptography, and logical challenge design.',
    images: [
      secmathsChalkboard,
      secmathsPrecision,
      secmathsAcademic,
      secmathsHomework
    ],
    approved: true
  },
  {
    id: 'aico-creation',
    name: 'AI Co-Creation & Playability Workshop',
    nameZh: 'AI Co-Creation & Playability Workshop',
    source: 'YVIA Next-Gen AI Technology',
    ageGroup: 'Ages 10-18 (AI Agency & Play)',
    duration: '8 Weeks Workshop',
    keyConcepts: [
      'Mastering AI Agency & Ownership',
      'Peer-led Group Collaboration',
      'Enhancing Real-World Playability',
      'Physical-Digital Hybrid Interaction'
    ],
    description: 'Empower kids to master AI as creative owners rather than mere consumers. Combining "peer group collaboration" with "real-world playability," this workshop guides students to integrate AI tools with physical media (tabletop board games, plant tokens, smart artifacts) to redesign interactive loops in their immediate surroundings.',
    descriptionZh: 'Empower kids to master AI as creative owners rather than mere consumers. Combining "peer group collaboration" with "real-world playability," this workshop guides students to integrate AI tools with physical media (tabletop board games, plant tokens, smart artifacts) to redesign interactive loops in their immediate surroundings.',
    images: [
      aicoCollaboration,
      aicoPromptDesign,
      aicoStoryboard,
      aicoPlayPhysical
    ],
    approved: true
  }
];

export const initialEvents: EventItem[] = [
  {
    id: 'aicocamp',
    title: 'AI Co-Creation Camp: Playability in Uncertainty',
    titleZh: 'AI Co-Creation Camp: Playability in Uncertainty',
    status: 'past',
    location: 'Rototuna Library, Hamilton, New Zealand',
    date: 'Held: May 2026',
    description: 'We will guide all participants to use AI tools to transform daily life into fun, interactive experiences. Through teamwork, we nurture children\'s innovative thinking and AI application skills while enhancing interaction among participants and exploring the endless possibilities of AI and playability together. Based on Citizens of Play references.',
    descriptionZh: 'We will guide all participants to use AI tools to transform daily life into fun, interactive experiences. Through teamwork, we nurture children\'s innovative thinking and AI application skills while enhancing interaction among participants and exploring the endless possibilities of AI and playability together. Based on Citizens of Play references.',
    targetAudience: 'Youth & Family Teams (7-16 years with parents)',
    images: [
      aicoCollaboration,
      aicoPromptDesign,
      aicoStoryboard,
      aicoPlayPhysical
    ],
    approved: true
  },
  {
    id: 'explore-scratch',
    title: 'Exploring with UCL ScratchMaths',
    titleZh: 'Exploring with UCL ScratchMaths',
    status: 'upcoming',
    location: 'Rototuna Library, Hamilton, New Zealand',
    date: 'Upcoming: June 2026',
    description: 'Dive directly into the ScratchMaths curriculum with hands-on, interactive computer challenges. Guided by YVIA youth peer leaders, children will learn how geometric angles trace beautiful spiral art and code their very first mathematically verified coordinate-chasing arcade game.',
    descriptionZh: 'Dive directly into the ScratchMaths curriculum with hands-on, interactive computer challenges. Guided by YVIA youth peer leaders, children will learn how geometric angles trace beautiful spiral art and code their very first mathematically verified coordinate-chasing arcade game.',
    targetAudience: 'Suggested Ages 8-12 (No laptop required, YVIA provided)',
    images: [
      scratchMathsLearning,
      scratchMathsPeer,
      scratchMathsArt,
      scratchMathsInterface
    ],
    approved: true
  }
];
