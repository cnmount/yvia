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
    nameZh: 'UCL 趣味积木数学 (ScratchMaths)',
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
    descriptionZh: '由世界顶尖的伦敦大学学院 (UCL) 教育研究院精心开发，ScratchMaths 将计算机图形编程与核心数学知识深度融合。在 YVIA 同伴导师的指导下，儿童通过拖拽积木块探索几何角度、对称性、变量与坐标网格，从被动的屏幕使用者蜕变为充满创造力的数学小程序员。',
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
    nameZh: '高空无人机机器人与自主飞行编程',
    source: 'YVIA Applied STEAM Curriculum',
    ageGroup: 'Ages 11-15 (Intermediate & High School)',
    duration: '8-10 Weeks Course',
    keyConcepts: [
      'Aerodynamics & Physics of Flight',
      'Autonomous Pilot Programming',
      'Coordinates in 3D Space',
      'Sensor Feedback & Telemetry'
    ],
    description: 'Our Drone program bridges the gap between software programming and physical mechanics. Moving beyond standard screen play, students assemble educational quadcopters, learn physical laws of lift, yaw, pitch, and roll, and write precise autonomous path scripts using Block-based languages and Python to navigate obstacle courses.',
    descriptionZh: '我们的无人机项目完美融合了代码编程与实体机械结构。孩子们将亲自动手组装教学用多轴飞行器，学习升力、俯仰、偏航等空气动力学机制，并使用图形化语言和 Python 编写精密算法，操控无人机完成酷炫的 3D 三维迷宫过障任务。',
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
    name: 'Modular Intelligent Robotics (MIR)',
    nameZh: 'MIR 模块化智能机器人设计与实体控制',
    source: 'Robotics Education Ecosystem',
    ageGroup: 'Ages 8-13 (Junior STEAM)',
    duration: '8-12 Weeks Course',
    keyConcepts: [
      'Sensory-Motor Control Loops',
      'Structural Engineering & Mechanics',
      'Conditional Logic & Branching',
      'Real-world Problem Solving'
    ],
    description: 'MIR combines high-precision modular joints, complex gears, and interactive sensors with block programming. Students design, build, and program physical robot prototypes (e.g. intelligent sorters, line-trackers) to explore the basics of engineering design, tactile learning, and system logic.',
    descriptionZh: 'MIR 融合了高精度的模块化机械关节、复杂的齿轮传动和敏感传感器件。孩子们将独立构思、组装并编程创制真实的智能分类器、自动巡线避障车等实体机器，实地探索工程学原理与逻辑闭环设计。',
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
    name: 'Dynamic Visual Mathematics (DVM)',
    nameZh: 'Hawgent 动态三维视觉几何数学学社',
    source: 'Technology & Research Center',
    ageGroup: 'Ages 10-15 (Interactive Visuals)',
    duration: '6-8 Weeks Course',
    keyConcepts: [
      'Dynamic Geometric Models',
      'Visualizing Algebraic Formulae',
      '3D Coordinate Projections',
      'Interactive Functions & Tracing'
    ],
    description: 'Featuring Maths professional visual-dynamic software suites, this course transforms static formulas and plane geometries into touchable, draggable interactive elements. Students develop intense geometric intuition and easily grasp algebraic equations by watching variables morph in real-time.',
    descriptionZh: '引入专业的数理动态图形组件，将晦涩的黑板公式和抽象平面几何转变为指尖可滑动旋转、自由演绎的探索工具。帮助孩子们迅速建立强大的立体空间直觉，在参数实时形变中秒懂代数定理的奥妙。',
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
    nameZh: '中学趣味探究数学与深度逻辑思考',
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
    descriptionZh: '专为中学生量身定制。在同伴先锋的趣味启发下，避开机械累赘的刷题折磨，共同领略让人拍案叫绝的硬核思维之美：无字几何证明、趣味密码破解与博弈论游戏设计，在合作中深度成长。',
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
    nameZh: 'AI 协同共创与实体可玩性创意工坊',
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
    descriptionZh: '旨在引导儿童扮演创造者的角色来驾驭 AI 工具，而非被动受众。我们将“同伴式协作机制”与“现实游戏的娱乐可玩性”相结合，用 AI 重塑身边的日常物件（实体桌游、绿植卡牌、智能挂件），实现数字与现实的妙趣交织。',
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
    titleZh: 'AI 协同创新令营：在不确定中重现“游戏力”',
    status: 'past',
    location: 'Rototuna Library, Hamilton, New Zealand',
    date: 'Held: Jan 2025',
    description: 'We will guide all participants to use AI tools to transform daily life into fun, interactive experiences. Through teamwork, we nurture children\'s innovative thinking and AI application skills while enhancing interaction among participants and exploring the endless possibilities of AI and playability together. Based on Citizens of Play references.',
    descriptionZh: '此活动引导参与者利用前沿 AI 助手将日常生活情境转变为好玩的互动游戏。通过跨年龄角色扮演与协作，激发孩子在未知挑战下的创新潜能，拉近亲子及同伴间的互助支持。设计源于 Citizens of Play 行动实践框架。',
    targetAudience: 'Youth & Family Teams',
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
    titleZh: '伦敦大学学院 (UCL) ScratchMaths 线下极客日',
    status: 'upcoming',
    location: 'Rototuna Library, Hamilton, New Zealand',
    date: 'Upcoming: July 2026',
    description: 'Dive directly into the ScratchMaths curriculum with hands-on, interactive computer challenges. Guided by YVIA youth peer leaders, children will learn how geometric angles trace beautiful spiral art and code their very first mathematically verified coordinate-chasing arcade game.',
    descriptionZh: '亲临现场深度参与 UCL 著名的趣味数理关卡。在 YVIA 青年同伴导师的面对面协助下，儿童将理解角度定理如何勾勒出惊艳的螺旋图形，并编写人生第一个符合代数模型、可畅玩的高分追逐射击游戏。',
    targetAudience: 'Suggested Ages 8-12',
    images: [
      scratchMathsLearning,
      scratchMathsPeer,
      scratchMathsArt,
      scratchMathsInterface
    ],
    approved: true
  }
];
