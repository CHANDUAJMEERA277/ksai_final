export interface LanguageConfig {

  id: string;

  name: string;

  extension: string;

  icon: string;

  projectName: string;

  defaultFile: string;

  defaultFolder?: string;

  compiler: string;

  run: string;

  aiRole: string;

  screenMentor: string;

  dictator: string;

  autoCode: string;

  interview: string;

}

export const LANGUAGES: LanguageConfig[] = [

  {

    id: "java",

    name: "Java",

    extension: ".java",

    icon: "java",

    projectName: "MyJavaProject",

    defaultFolder: "src",

    defaultFile: "Main.java",

    compiler: "javac",

    run: "java",

    aiRole: "Java Expert",

    screenMentor: "Java Mentor",

    dictator: "Java Dictator",

    autoCode: "Java Auto Code",

    interview: "Java Interview",

  },

  {

    id: "python",

    name: "Python",

    extension: ".py",

    icon: "python",

    projectName: "MyPythonProject",

    defaultFile: "main.py",

    compiler: "python",

    run: "python",

    aiRole: "Python Expert",

    screenMentor: "Python Mentor",

    dictator: "Python Dictator",

    autoCode: "Python Auto Code",

    interview: "Python Interview",

  },

  {

    id: "c",

    name: "C",

    extension: ".c",

    icon: "c",

    projectName: "MyCProject",

    defaultFile: "main.c",

    compiler: "gcc",

    run: "./main",

    aiRole: "C Expert",

    screenMentor: "C Mentor",

    dictator: "C Dictator",

    autoCode: "C Auto Code",

    interview: "C Interview",

  },

  {

    id: "cpp",

    name: "C++",

    extension: ".cpp",

    icon: "cpp",

    projectName: "MyCppProject",

    defaultFile: "main.cpp",

    compiler: "g++",

    run: "./main",

    aiRole: "C++ Expert",

    screenMentor: "C++ Mentor",

    dictator: "C++ Dictator",

    autoCode: "C++ Auto Code",

    interview: "C++ Interview",

  },

  {

    id: "javascript",

    name: "JavaScript",

    extension: ".js",

    icon: "javascript",

    projectName: "MyJavaScriptProject",

    defaultFile: "index.js",

    compiler: "node",

    run: "node",

    aiRole: "JavaScript Expert",

    screenMentor: "JavaScript Mentor",

    dictator: "JavaScript Dictator",

    autoCode: "JavaScript Auto Code",

    interview: "JavaScript Interview",

  },

  {

    id: "typescript",

    name: "TypeScript",

    extension: ".ts",

    icon: "typescript",

    projectName: "MyTypeScriptProject",

    defaultFile: "index.ts",

    compiler: "tsc",

    run: "node",

    aiRole: "TypeScript Expert",

    screenMentor: "TypeScript Mentor",

    dictator: "TypeScript Dictator",

    autoCode: "TypeScript Auto Code",

    interview: "TypeScript Interview",

  },

  {

    id: "react",

    name: "React",

    extension: ".tsx",

    icon: "react",

    projectName: "MyReactProject",

    defaultFolder: "src",

    defaultFile: "App.tsx",

    compiler: "npm",

    run: "npm run dev",

    aiRole: "React Expert",

    screenMentor: "React Mentor",

    dictator: "React Dictator",

    autoCode: "React Auto Code",

    interview: "React Interview",

  },

  {

    id: "node",

    name: "Node.js",

    extension: ".js",

    icon: "node",

    projectName: "MyNodeProject",

    defaultFile: "server.js",

    compiler: "node",

    run: "node",

    aiRole: "Node Expert",

    screenMentor: "Node Mentor",

    dictator: "Node Dictator",

    autoCode: "Node Auto Code",

    interview: "Node Interview",

  },

  {

    id: "go",

    name: "Go",

    extension: ".go",

    icon: "go",

    projectName: "MyGoProject",

    defaultFile: "main.go",

    compiler: "go",

    run: "go run",

    aiRole: "Go Expert",

    screenMentor: "Go Mentor",

    dictator: "Go Dictator",

    autoCode: "Go Auto Code",

    interview: "Go Interview",

  },

  {

    id: "rust",

    name: "Rust",

    extension: ".rs",

    icon: "rust",

    projectName: "MyRustProject",

    defaultFile: "main.rs",

    compiler: "cargo",

    run: "cargo run",

    aiRole: "Rust Expert",

    screenMentor: "Rust Mentor",

    dictator: "Rust Dictator",

    autoCode: "Rust Auto Code",

    interview: "Rust Interview",

  },

];