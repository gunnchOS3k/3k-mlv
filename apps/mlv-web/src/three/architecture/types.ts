export type PhaseToken = string;

export type BuildingTypology =
  | 'civic_industrial_hall'
  | 'learning_pavilion'
  | 'raised_spine'
  | 'workshop_shed'
  | 'apprenticeship_grid'
  | 'temporary_module'
  | 'polar_research_module';

export type CampusArchitectureDefinition = {
  slug: string;
  atlas_name: string;
  silhouette: string;
  site_plan: string;
  massing: string;
  public_realm: string[];
  specialist_spaces: string[];
  truth_labels?: string[];
  phase_logic: 'standard' | 'recovery_network' | 'remote_twin';
};

export type ModuleProps = {
  position?: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  label?: string;
};
