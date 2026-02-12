export class CreateStrategicActionDto {
  title: string;
  description?: string;
  priority?: 'HAUTE' | 'MOYENNE' | 'BASSE';
  timeline?: string;
  resources?: string;
  position?: number;
}

export class UpdateStrategicActionDto {
  title?: string;
  description?: string;
  priority?: 'HAUTE' | 'MOYENNE' | 'BASSE';
  timeline?: string;
  resources?: string;
  position?: number;
}
