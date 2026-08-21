const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const Candidate = require("./src/models/Candidate");
const CandidateAuth = require("./src/models/CandidateAuth");
const Internship = require("./src/models/Internship");
const Government = require("./src/models/Government");
const Allocation = require("./src/models/Allocation");

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Database. Clearing old data...");

    await Candidate.deleteMany({});
    await CandidateAuth.deleteMany({});
    await Internship.deleteMany({});
    await Government.deleteMany({});
    await Allocation.deleteMany({});

    console.log("Generating Government Users...");
    const govPassword = await bcrypt.hash("admin123", 10);
    await Government.create([
      {
        name: "Directorate of IT",
        email: "admin@india.gov.in",
        password: govPassword,
        department: "Ministry of Corporate Affairs (MoCA)",
        role: "admin",
      },
      {
        name: "MoCA Allocation Officer",
        email: "officer@moca.gov.in",
        password: govPassword,
        department: "PM Internship Scheme Cell",
        role: "officer",
      }
    ]);

    console.log("Generating 12 Diverse Internships across PSUs & Enterprises...");
    const internships = await Internship.insertMany([
      {
        title: "Frontend Developer Intern",
        organization: "Ministry of Education",
        description: "Develop interactive web portals for national student outreach using React and modern frontend tools.",
        requiredSkills: ["React", "JavaScript", "HTML", "CSS"],
        role: "Frontend Developer",
        location: "New Delhi",
        sector: "IT",
        requiredExperience: 0,
        totalSeats: 3,
        availableSeats: 3,
        eligibilityCriteria: { degrees: ["B.Tech", "B.E", "MCA"], branches: ["Computer Science", "IT"], minGraduationYear: 2024 }
      },
      {
        title: "Machine Learning Researcher",
        organization: "DRDO",
        description: "Work on computer vision and radar signal analysis algorithms.",
        requiredSkills: ["Python", "Machine Learning", "TensorFlow", "C++"],
        role: "Machine Learning Engineer",
        location: "Bengaluru",
        sector: "Defense",
        requiredExperience: 0,
        totalSeats: 2,
        availableSeats: 2,
        eligibilityCriteria: { degrees: ["B.Tech", "M.Tech"], branches: ["Computer Science"], minGraduationYear: 2023 }
      },
      {
        title: "Backend Engineer Intern",
        organization: "NITI Aayog",
        description: "Build scalable APIs in Node.js for the national Aspirational Districts analytics dashboard.",
        requiredSkills: ["Node.js", "Express", "MongoDB", "JavaScript"],
        role: "Backend Developer",
        location: "New Delhi",
        sector: "IT",
        requiredExperience: 1,
        totalSeats: 4,
        availableSeats: 4,
      },
      {
        title: "Full Stack Web Intern",
        organization: "ISRO",
        description: "Develop internal tracking tools and mission telemetry visualization platforms.",
        requiredSkills: ["React", "Node.js", "MongoDB", "Python"],
        role: "Full Stack Developer",
        location: "Bengaluru",
        sector: "Space",
        requiredExperience: 0,
        totalSeats: 3,
        availableSeats: 3,
      },
      {
        title: "Cybersecurity Analyst Intern",
        organization: "Ministry of Home Affairs",
        description: "Analyze network traffic and identify vulnerabilities in critical infrastructure.",
        requiredSkills: ["Cybersecurity", "Networking", "Python", "Linux"],
        role: "Security Analyst",
        location: "New Delhi",
        sector: "Defense",
        requiredExperience: 0,
        totalSeats: 2,
        availableSeats: 2,
      },
      {
        title: "Public Finance Data Analyst",
        organization: "Ministry of Finance",
        description: "Process and analyze large datasets regarding state and central budget allocations.",
        requiredSkills: ["Python", "SQL", "Pandas", "Data Visualization"],
        role: "Data Analyst",
        location: "Mumbai",
        sector: "Finance",
        requiredExperience: 0,
        totalSeats: 4,
        availableSeats: 4,
      },
      {
        title: "UI/UX & Accessibility Designer",
        organization: "Ministry of Electronics & IT (MeitY)",
        description: "Design accessible digital user interfaces for government portals with multilingual support.",
        requiredSkills: ["Figma", "UI/UX", "Adobe XD", "Design"],
        role: "Designer",
        location: "New Delhi",
        sector: "IT",
        requiredExperience: 0,
        totalSeats: 2,
        availableSeats: 2,
      },
      {
        title: "FinTech & Blockchain Research Intern",
        organization: "Reserve Bank of India (RBI)",
        description: "Research programmable payments and smart contract architecture for Central Bank Digital Currency.",
        requiredSkills: ["Blockchain", "Solidity", "Web3", "Cryptography"],
        role: "Blockchain Engineer",
        location: "Mumbai",
        sector: "Finance",
        requiredExperience: 0,
        totalSeats: 2,
        availableSeats: 2,
      },
      {
        title: "Cloud & DevOps Intern",
        organization: "National Informatics Centre (NIC)",
        description: "Manage CI/CD pipelines, Docker containers, and cloud infrastructure for citizen services.",
        requiredSkills: ["Docker", "Kubernetes", "AWS", "Linux"],
        role: "DevOps Engineer",
        location: "Pune",
        sector: "IT",
        requiredExperience: 0,
        totalSeats: 3,
        availableSeats: 3,
      },
      {
        title: "Embedded Systems & Hardware Intern",
        organization: "Bharat Electronics Limited (BEL)",
        description: "Design and test microcontrollers, VHDL circuits, and smart energy meters.",
        requiredSkills: ["C", "Embedded Systems", "Hardware Design", "VHDL"],
        role: "Hardware Engineer",
        location: "Bengaluru",
        sector: "Electronics",
        requiredExperience: 0,
        totalSeats: 3,
        availableSeats: 3,
      },
      {
        title: "Renewable Energy Research Intern",
        organization: "NTPC Green Energy",
        description: "Model solar irradiance and grid storage optimization using Python and IoT sensors.",
        requiredSkills: ["Python", "Data Analysis", "Renewable Energy", "MATLAB"],
        role: "Energy Analyst",
        location: "New Delhi",
        sector: "Energy",
        requiredExperience: 0,
        totalSeats: 3,
        availableSeats: 3,
      },
      {
        title: "Smart Logistics & Mobile App Developer",
        organization: "Ministry of Railways",
        description: "Build cross-platform mobile apps for freight movement monitoring.",
        requiredSkills: ["Flutter", "Dart", "Firebase", "Mobile Development"],
        role: "Mobile Developer",
        location: "Hyderabad",
        sector: "Transport",
        requiredExperience: 0,
        totalSeats: 3,
        availableSeats: 3,
      }
    ]);

    console.log("Generating 14 Diverse Candidates with Affirmative Action & Aspirational District Data...");
    const candidatePassword = await bcrypt.hash("password123", 10);
    
    const findInt = (title) => internships.find(i => i.title.includes(title))?._id;

    const rawCandidates = [
      {
        name: "Priya Sharma",
        email: "priya@example.com",
        phone: "+91 9876543201",
        education: { degree: "B.Tech", branch: "Computer Science", college: "Govt Engineering College Wayanad", graduationYear: 2025 },
        skills: ["Python", "Machine Learning", "TensorFlow", "Pandas", "C++"],
        preferredLocations: ["Bengaluru", "New Delhi"],
        preferredRoles: ["Machine Learning Engineer", "Data Analyst"],
        preferredSectors: ["Defense", "IT"],
        experience: 0,
        eligibility: true,
        gender: "Female",
        socialCategory: "OBC",
        district: "Wayanad",
        state: "Kerala",
        areaType: "Rural",
        isAspirationalDistrict: true,
        pastBeneficiary: false,
        firstGenerationLearner: true,
        preferences: [findInt("Machine Learning"), findInt("Public Finance"), findInt("Full Stack")].filter(Boolean)
      },
      {
        name: "Ramesh Kumar Soren",
        email: "ramesh@example.com",
        phone: "+91 9876543202",
        education: { degree: "B.Tech", branch: "IT", college: "NIT Raipur", graduationYear: 2024 },
        skills: ["Node.js", "Express", "MongoDB", "JavaScript", "React"],
        preferredLocations: ["New Delhi", "Pune"],
        preferredRoles: ["Backend Developer", "Full Stack Developer"],
        preferredSectors: ["IT", "Government"],
        experience: 1,
        eligibility: true,
        gender: "Male",
        socialCategory: "ST",
        district: "Sukma",
        state: "Chhattisgarh",
        areaType: "Rural",
        isAspirationalDistrict: true,
        pastBeneficiary: false,
        firstGenerationLearner: true,
        preferences: [findInt("Backend Engineer"), findInt("Frontend Developer"), findInt("Cloud")].filter(Boolean)
      },
      {
        name: "Ananya Patel",
        email: "ananya@example.com",
        phone: "+91 9876543203",
        education: { degree: "B.Des", branch: "Interaction Design", college: "NID Ahmedabad", graduationYear: 2024 },
        skills: ["Figma", "UI/UX", "Adobe XD", "Design", "User Research"],
        preferredLocations: ["New Delhi", "Mumbai"],
        preferredRoles: ["Designer"],
        preferredSectors: ["IT", "Tourism"],
        experience: 0,
        eligibility: true,
        gender: "Female",
        socialCategory: "General",
        district: "Ahmedabad",
        state: "Gujarat",
        areaType: "Urban",
        isAspirationalDistrict: false,
        pastBeneficiary: false,
        firstGenerationLearner: false,
        preferences: [findInt("UI/UX"), findInt("Frontend Developer")].filter(Boolean)
      },
      {
        name: "Manoj Paswan",
        email: "manoj@example.com",
        phone: "+91 9876543204",
        education: { degree: "B.Tech", branch: "Computer Science", college: "IIT Patna", graduationYear: 2024 },
        skills: ["Cybersecurity", "Networking", "Python", "Linux", "Bash"],
        preferredLocations: ["New Delhi"],
        preferredRoles: ["Security Analyst"],
        preferredSectors: ["Defense", "Government"],
        experience: 0,
        eligibility: true,
        gender: "Male",
        socialCategory: "SC",
        district: "Bahraich",
        state: "Uttar Pradesh",
        areaType: "Rural",
        isAspirationalDistrict: true,
        pastBeneficiary: false,
        firstGenerationLearner: true,
        preferences: [findInt("Cybersecurity"), findInt("Cloud")].filter(Boolean)
      },
      {
        name: "Sneha Mukherjee",
        email: "sneha@example.com",
        phone: "+91 9876543205",
        education: { degree: "B.Sc", branch: "Statistics", college: "St. Xavier's Mumbai", graduationYear: 2025 },
        skills: ["Python", "SQL", "Pandas", "Data Visualization", "R"],
        preferredLocations: ["Mumbai", "New Delhi"],
        preferredRoles: ["Data Analyst"],
        preferredSectors: ["Finance", "Energy"],
        experience: 0,
        eligibility: true,
        gender: "Female",
        socialCategory: "EWS",
        district: "Bhojpur",
        state: "Bihar",
        areaType: "Semi-Urban",
        isAspirationalDistrict: true,
        pastBeneficiary: false,
        firstGenerationLearner: true,
        preferences: [findInt("Public Finance"), findInt("Renewable Energy")].filter(Boolean)
      },
      {
        name: "Ravi Shankar",
        email: "ravi@example.com",
        phone: "+91 9876543206",
        education: { degree: "B.Tech", branch: "Cybersecurity", college: "IIT Kanpur", graduationYear: 2024 },
        skills: ["Cybersecurity", "Networking", "Python", "Linux"],
        preferredLocations: ["New Delhi"],
        preferredRoles: ["Security Analyst"],
        preferredSectors: ["Defense"],
        experience: 1,
        eligibility: true,
        gender: "Male",
        socialCategory: "General",
        district: "Kanpur",
        state: "Uttar Pradesh",
        areaType: "Urban",
        isAspirationalDistrict: false,
        pastBeneficiary: false,
        firstGenerationLearner: false,
        preferences: [findInt("Cybersecurity"), findInt("Machine Learning")].filter(Boolean)
      },
      {
        name: "Fatima Zehra",
        email: "fatima@example.com",
        phone: "+91 9876543207",
        education: { degree: "B.Tech", branch: "Electronics", college: "NIT Srinagar", graduationYear: 2025 },
        skills: ["C", "Embedded Systems", "Hardware Design", "VHDL", "Microcontrollers"],
        preferredLocations: ["Bengaluru", "New Delhi"],
        preferredRoles: ["Hardware Engineer"],
        preferredSectors: ["Electronics", "Space"],
        experience: 0,
        eligibility: true,
        gender: "Female",
        socialCategory: "OBC",
        district: "Kupwara",
        state: "Jammu & Kashmir",
        areaType: "Rural",
        isAspirationalDistrict: true,
        pastBeneficiary: false,
        firstGenerationLearner: true,
        preferences: [findInt("Embedded Systems"), findInt("Full Stack")].filter(Boolean)
      },
      {
        name: "Kavya Menon",
        email: "kavya@example.com",
        phone: "+91 9876543208",
        education: { degree: "B.Tech", branch: "Computer Science", college: "IIT Bombay", graduationYear: 2023 },
        skills: ["Blockchain", "Solidity", "Web3", "Cryptography", "JavaScript"],
        preferredLocations: ["Mumbai", "Bengaluru"],
        preferredRoles: ["Blockchain Engineer"],
        preferredSectors: ["Finance", "IT"],
        experience: 1,
        eligibility: true,
        gender: "Female",
        socialCategory: "General",
        district: "Mumbai",
        state: "Maharashtra",
        areaType: "Urban",
        isAspirationalDistrict: false,
        pastBeneficiary: false,
        firstGenerationLearner: false,
        preferences: [findInt("FinTech"), findInt("Public Finance")].filter(Boolean)
      },
      {
        name: "Vikram Gokhale",
        email: "vikram@example.com",
        phone: "+91 9876543209",
        education: { degree: "B.E", branch: "IT", college: "Pune University", graduationYear: 2024 },
        skills: ["Docker", "Kubernetes", "AWS", "Linux", "CI/CD"],
        preferredLocations: ["Pune", "Mumbai"],
        preferredRoles: ["DevOps Engineer"],
        preferredSectors: ["IT"],
        experience: 1,
        eligibility: true,
        gender: "Male",
        socialCategory: "General",
        district: "Pune",
        state: "Maharashtra",
        areaType: "Urban",
        isAspirationalDistrict: false,
        pastBeneficiary: false,
        firstGenerationLearner: false,
        preferences: [findInt("Cloud"), findInt("Backend Engineer")].filter(Boolean)
      },
      {
        name: "Aditi Rao",
        email: "aditi@example.com",
        phone: "+91 9876543210",
        education: { degree: "MCA", branch: "Computer Science", college: "Osmania University", graduationYear: 2024 },
        skills: ["Flutter", "Dart", "Firebase", "Mobile Development", "Android"],
        preferredLocations: ["Hyderabad", "Bengaluru"],
        preferredRoles: ["Mobile Developer"],
        preferredSectors: ["Transport", "IT"],
        experience: 0,
        eligibility: true,
        gender: "Female",
        socialCategory: "OBC",
        district: "Nuh",
        state: "Haryana",
        areaType: "Rural",
        isAspirationalDistrict: true,
        pastBeneficiary: false,
        firstGenerationLearner: true,
        preferences: [findInt("Smart Logistics"), findInt("Frontend Developer")].filter(Boolean)
      },
      {
        name: "Siddharth Verma",
        email: "siddharth@example.com",
        phone: "+91 9876543211",
        education: { degree: "B.Tech", branch: "Electrical Engineering", college: "IIT Roorkee", graduationYear: 2025 },
        skills: ["Python", "Data Analysis", "Renewable Energy", "MATLAB", "SQL"],
        preferredLocations: ["New Delhi", "Mumbai"],
        preferredRoles: ["Energy Analyst", "Data Analyst"],
        preferredSectors: ["Energy", "Finance"],
        experience: 0,
        eligibility: true,
        gender: "Male",
        socialCategory: "SC",
        district: "Barmer",
        state: "Rajasthan",
        areaType: "Rural",
        isAspirationalDistrict: true,
        pastBeneficiary: false,
        firstGenerationLearner: true,
        preferences: [findInt("Renewable Energy"), findInt("Public Finance")].filter(Boolean)
      },
      {
        name: "Rahul Sharma",
        email: "rahul@example.com",
        phone: "+91 9876543212",
        education: { degree: "B.Tech", branch: "Computer Science", college: "IIT Delhi", graduationYear: 2025 },
        skills: ["React", "JavaScript", "HTML", "CSS", "Node.js", "MongoDB"],
        preferredLocations: ["New Delhi", "Bengaluru"],
        preferredRoles: ["Frontend Developer", "Full Stack Developer"],
        preferredSectors: ["IT", "Space"],
        experience: 0,
        eligibility: true,
        gender: "Male",
        socialCategory: "General",
        district: "New Delhi",
        state: "Delhi",
        areaType: "Urban",
        isAspirationalDistrict: false,
        pastBeneficiary: false,
        firstGenerationLearner: false,
        preferences: [findInt("Frontend Developer"), findInt("Full Stack")].filter(Boolean)
      },
      {
        name: "Sunita Devi",
        email: "sunita@example.com",
        phone: "+91 9876543213",
        education: { degree: "B.Tech", branch: "Computer Science", college: "BIT Mesra", graduationYear: 2024 },
        skills: ["React", "JavaScript", "HTML", "CSS", "UI/UX"],
        preferredLocations: ["New Delhi", "Hyderabad"],
        preferredRoles: ["Frontend Developer", "Designer"],
        preferredSectors: ["IT"],
        experience: 0,
        eligibility: true,
        gender: "Female",
        socialCategory: "ST",
        district: "Khunti",
        state: "Jharkhand",
        areaType: "Rural",
        isAspirationalDistrict: true,
        pastBeneficiary: false,
        firstGenerationLearner: true,
        preferences: [findInt("Frontend Developer"), findInt("UI/UX")].filter(Boolean)
      },
      {
        name: "Amit Kumar",
        email: "amit.k@example.com",
        phone: "+91 9876543214",
        education: { degree: "B.Tech", branch: "Mechanical Engineering", college: "NIT Durgapur", graduationYear: 2023 },
        skills: ["Python", "MATLAB", "Data Analysis", "Renewable Energy"],
        preferredLocations: ["New Delhi"],
        preferredRoles: ["Energy Analyst"],
        preferredSectors: ["Energy"],
        experience: 1,
        eligibility: true,
        gender: "Male",
        socialCategory: "EWS",
        district: "Purulia",
        state: "West Bengal",
        areaType: "Rural",
        isAspirationalDistrict: true,
        pastBeneficiary: false,
        firstGenerationLearner: false,
        preferences: [findInt("Renewable Energy")].filter(Boolean)
      }
    ];

    for (const cData of rawCandidates) {
      const candidate = await Candidate.create(cData);
      await CandidateAuth.create({
        email: cData.email,
        password: candidatePassword,
        candidate: candidate._id
      });
    }

    console.log("-----------------------------------------");
    console.log("SEEDING COMPLETED SUCCESSFULLY!");
    console.log("-----------------------------------------");
    console.log(`Generated ${internships.length} Internships and ${rawCandidates.length} Diverse Candidates.`);
    console.log("");
    console.log("LOGINS FOR TESTING & DEMO:");
    console.log("1. MoCA / Admin Portal: admin@india.gov.in / admin123");
    console.log("2. Candidate (Aspirational District + Rural + Female + ML): priya@example.com / password123");
    console.log("3. Candidate (ST + Aspirational District + Backend): ramesh@example.com / password123");
    console.log("4. Candidate (SC + Rural + Cybersecurity): manoj@example.com / password123");
    console.log("5. Candidate (Female + Aspirational + Hardware): fatima@example.com / password123");
    console.log("-----------------------------------------");
    
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
