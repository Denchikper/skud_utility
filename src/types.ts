export type Theme = "light" | "dark" | "system";

export interface Profile {
  id: string;
  label: string;
  folder: string;
}

export interface Settings {
  gpFolder: string;
  programPath: string;
  destFilePath: string;
  theme: Theme;
  profiles: Profile[];
}

export type View = "main" | "settings";
