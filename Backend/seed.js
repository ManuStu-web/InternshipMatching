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
        department: "Ministry of Electronics and Information Technology (MeitY)",
        role: "admin",
      },
      {
        name: "DRDO Officer",
        email: "officer@drdo.gov.in",
        password: govPassword,
        department: "DRDO",
        role: "officer",
      }
    ]);

    console.log("Generating 14 Internships...");
    const internships = await Internship.insertMany([
      {
        title: "Frontend Developer Intern",
        organization: "Ministry of Education",
        description: "Develop interactive web portals for student outreach using React and modern frontend tools.",
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
        description: "Work on computer vision models for satellite imagery analysis.",
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
        description: "Build scalable APIs in Node.js for national data analytics dashboard.",
        requiredSkills: ["Node.js", "Express", "MongoDB", "JavaScript"],
        role: "Backend Developer",
        location: "New Delhi",
        sector: "IT",
        requiredExperience: 1,
        totalSeats: 5,
        availableSeats: 5,
      },
      {
        title: "Full Stack Web Intern",
        organization: "ISRO",
        description: "Develop internal tools for mission tracking.",
        requiredSkills: ["React", "Node.js", "MongoDB", "Python"],
        role: "Full Stack Developer",
        location: "Bengaluru",
        sector: "Space",
        requiredExperience: 0,
        totalSeats: 4,
        availableSeats: 4,
      },
      {
        title: "Cybersecurity Analyst Intern",
        organization: "Ministry of Home Affairs",
        description: "Analyze network traffic and identify vulnerabilities in critical infrastructure.",
        requiredSkills: ["Cybersecurity", "Networking", "Python", "Linux"],
        role: "Security Analyst",
        location: "New Delhi",
        sector: "Defense",
        requiredExperience: 1,
        totalSeats: 3,
        availableSeats: 3,
      },
      {
        title: "Data Analyst",
        organization: "Ministry of Finance",
        description: "Process and analyze large datasets regarding national budget allocations.",
        requiredSkills: ["Python", "SQL", "Pandas", "Data Visualization"],
        role: "Data Analyst",
        location: "Mumbai",
        sector: "Finance",
        requiredExperience: 0,
        totalSeats: 6,
        availableSeats: 6,
      },
      {
        title: "UI/UX Designer",
        organization: "Ministry of Tourism",
        description: "Design user interfaces for the 'Incredible India' tourism mobile app.",
        requiredSkills: ["Figma", "UI/UX", "Adobe XD", "Design"],
        role: "Designer",
        location: "New Delhi",
        sector: "Tourism",
        requiredExperience: 0,
        totalSeats: 2,
        availableSeats: 2,
      },
      {
        title: "Blockchain Developer",
        organization: "Reserve Bank of India (RBI)",
        description: "Research and develop smart contracts for the Digital Rupee initiative.",
        requiredSkills: ["Blockchain", "Solidity", "Web3", "Cryptography"],
        role: "Blockchain Engineer",
        location: "Mumbai",
        sector: "Finance",
        requiredExperience: 1,
        totalSeats: 2,
        availableSeats: 2,
      },
      {
        title: "DevOps Engineer Intern",
        organization: "National Informatics Centre (NIC)",
        description: "Manage CI/CD pipelines and Kubernetes clusters for government portals.",
        requiredSkills: ["Docker", "Kubernetes", "AWS", "CI/CD"],
        role: "DevOps Engineer",
        location: "Pune",
        sector: "IT",
        requiredExperience: 1,
        totalSeats: 3,
        availableSeats: 3,
      },
      {
        title: "NLP Researcher",
        organization: "Ministry of External Affairs",
        description: "Develop language translation models for Indian regional languages.",
        requiredSkills: ["Python", "NLP", "Machine Learning", "PyTorch"],
        role: "Machine Learning Engineer",
        location: "New Delhi",
        sector: "IT",
        requiredExperience: 2,
        totalSeats: 2,
        availableSeats: 2,
      },
      {
        title: "Hardware Engineer Intern",
        organization: "ISRO",
        description: "Design and test embedded systems for telemetry tracking.",
        requiredSkills: ["C", "Embedded Systems", "Hardware Design", "VHDL"],
        role: "Hardware Engineer",
        location: "Bengaluru",
        sector: "Space",
        requiredExperience: 0,
        totalSeats: 4,
        availableSeats: 4,
      },
      {
        title: "Flutter Mobile Developer",
        organization: "Ministry of Railways",
        description: "Build cross-platform mobile apps for IRCTC ticket tracking.",
        requiredSkills: ["Flutter", "Dart", "Firebase", "Mobile Development"],
        role: "Mobile Developer",
        location: "Hyderabad",
        sector: "Transport",
        requiredExperience: 0,
        totalSeats: 5,
        availableSeats: 5,
      },
      {
        title: "Cloud Architect Intern",
        organization: "C-DAC",
        description: "Design robust cloud architectures on AWS for supercomputing data centers.",
        requiredSkills: ["AWS", "Cloud Computing", "Linux", "Networking"],
        role: "Cloud Architect",
        location: "Pune",
        sector: "IT",
        requiredExperience: 1,
        totalSeats: 2,
        availableSeats: 2,
      },
      {
        title: "System Administrator",
        organization: "PMO",
        description: "Maintain and monitor highly secure internal servers.",
        requiredSkills: ["Linux", "Bash", "System Administration", "Networking"],
        role: "System Administrator",
        location: "New Delhi",
        sector: "Government",
        requiredExperience: 2,
        totalSeats: 1,
        availableSeats: 1,
      }
    ]);

    console.log("Generating Candidates...");
    const candidatePassword = await bcrypt.hash("password123", 10);
    
    // Create candidates that match perfectly with the new roles
    const rawCandidates = [
      { // Matches Cybersecurity
        name: "Ravi Shankar", email: "ravi@example.com", phone: "+91 9123456780",
        education: { degree: "B.Tech", branch: "Cybersecurity", college: "IIT Kanpur", graduationYear: 2024 },
        skills: ["Cybersecurity", "Networking", "Python", "Linux"],
        preferredLocations: ["New Delhi"], preferredRoles: ["Security Analyst"], preferredSectors: ["Defense"],
        experience: 1, eligibility: true
      },
      { // Matches Data Analyst (Finance)
        name: "Sneha Iyer", email: "sneha@example.com", phone: "+91 9123456781",
        education: { degree: "B.Sc", branch: "Statistics", college: "St. Xavier's Mumbai", graduationYear: 2025 },
        skills: ["Python", "SQL", "Pandas", "Data Visualization", "R"],
        preferredLocations: ["Mumbai"], preferredRoles: ["Data Analyst"], preferredSectors: ["Finance"],
        experience: 0, eligibility: true
      },
      { // Matches UI/UX Designer
        name: "Arjun Reddy", email: "arjun@example.com", phone: "+91 9123456782",
        education: { degree: "B.Des", branch: "Interaction Design", college: "NID Ahmedabad", graduationYear: 2024 },
        skills: ["Figma", "UI/UX", "Adobe XD", "Design", "Prototyping"],
        preferredLocations: ["New Delhi", "Ahmedabad"], preferredRoles: ["Designer"], preferredSectors: ["Tourism"],
        experience: 0, eligibility: true
      },
      { // Matches Blockchain Developer
        name: "Kavya Menon", email: "kavya@example.com", phone: "+91 9123456783",
        education: { degree: "B.Tech", branch: "Computer Science", college: "IIT Bombay", graduationYear: 2023 },
        skills: ["Blockchain", "Solidity", "Web3", "Cryptography", "JavaScript"],
        preferredLocations: ["Mumbai", "Bengaluru"], preferredRoles: ["Blockchain Engineer"], preferredSectors: ["Finance", "IT"],
        experience: 1, eligibility: true
      },
      { // Matches DevOps Engineer
        name: "Vikram Gokhale", email: "vikram.g@example.com", phone: "+91 9123456784",
        education: { degree: "B.E", branch: "IT", college: "Pune University", graduationYear: 2024 },
        skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"],
        preferredLocations: ["Pune"], preferredRoles: ["DevOps Engineer"], preferredSectors: ["IT"],
        experience: 1, eligibility: true
      },
      { // Matches NLP Researcher
        name: "Ananya Desai", email: "ananya@example.com", phone: "+91 9123456785",
        education: { degree: "M.Tech", branch: "Data Science", college: "IIIT Delhi", graduationYear: 2023 },
        skills: ["Python", "NLP", "Machine Learning", "PyTorch"],
        preferredLocations: ["New Delhi"], preferredRoles: ["Machine Learning Engineer"], preferredSectors: ["IT"],
        experience: 2, eligibility: true
      },
      { // Matches Hardware Engineer
        name: "Rohan Chatterjee", email: "rohan@example.com", phone: "+91 9123456786",
        education: { degree: "B.Tech", branch: "Electronics", college: "NIT Trichy", graduationYear: 2025 },
        skills: ["C", "Embedded Systems", "Hardware Design", "VHDL", "Microcontrollers"],
        preferredLocations: ["Bengaluru", "Chennai"], preferredRoles: ["Hardware Engineer"], preferredSectors: ["Space"],
        experience: 0, eligibility: true
      },
      { // Matches Mobile Developer
        name: "Aditi Rao", email: "aditi@example.com", phone: "+91 9123456787",
        education: { degree: "MCA", branch: "Computer Applications", college: "Osmania University", graduationYear: 2024 },
        skills: ["Flutter", "Dart", "Firebase", "Mobile Development", "Android"],
        preferredLocations: ["Hyderabad"], preferredRoles: ["Mobile Developer"], preferredSectors: ["Transport", "IT"],
        experience: 0, eligibility: true
      },
      { // Matches Cloud Architect
        name: "Siddharth Jain", email: "sid@example.com", phone: "+91 9123456788",
        education: { degree: "B.Tech", branch: "Computer Science", college: "COEP", graduationYear: 2023 },
        skills: ["AWS", "Cloud Computing", "Linux", "Networking", "Azure"],
        preferredLocations: ["Pune", "Mumbai"], preferredRoles: ["Cloud Architect"], preferredSectors: ["IT"],
        experience: 1, eligibility: true
      },
      { // Matches System Administrator
        name: "Manoj Tiwari", email: "manoj@example.com", phone: "+91 9123456789",
        education: { degree: "B.Sc", branch: "IT", college: "Delhi University", graduationYear: 2021 },
        skills: ["Linux", "Bash", "System Administration", "Networking", "Security"],
        preferredLocations: ["New Delhi"], preferredRoles: ["System Administrator"], preferredSectors: ["Government"],
        experience: 3, eligibility: true
      },
      { // Broad Full Stack Dev (Matches multiple)
        name: "Rahul Sharma", email: "rahul@example.com", phone: "+91 9876543210",
        education: { degree: "B.Tech", branch: "Computer Science", college: "IIT Delhi", graduationYear: 2025 },
        skills: ["React", "JavaScript", "HTML", "CSS", "Node.js", "MongoDB"],
        preferredLocations: ["New Delhi", "Bengaluru"], preferredRoles: ["Frontend Developer", "Full Stack Developer", "Backend Developer"], preferredSectors: ["IT", "Space"],
        experience: 0, eligibility: true
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
    console.log("SEEDING COMPLETE!");
    console.log("-----------------------------------------");
    console.log("Generated 14 Internships and 11 Highly-Targeted Candidates.");
    console.log("");
    console.log("You can log in to the prototype with these test accounts:");
    console.log("");
    console.log("GOVERNMENT / ADMIN LOGIN:");
    console.log("  Email: admin@india.gov.in");
    console.log("  Password: admin123");
    console.log("");
    console.log("CANDIDATE LOGINS:");
    console.log("  Email: ravi@example.com (Cybersecurity Match)");
    console.log("  Email: sneha@example.com (Data Analyst Match)");
    console.log("  Email: arjun@example.com (Designer Match)");
    console.log("  Email: aditi@example.com (Flutter Mobile Match)");
    console.log("  Password: password123 (for all candidates)");
    console.log("-----------------------------------------");
    
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
