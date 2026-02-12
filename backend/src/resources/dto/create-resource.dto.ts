export class CreateResourceDto {
  title: string;
  description?: string;
  type: string;
  size?: string;
  fileKey?: string;
  position?: number;
}

export class UpdateResourceDto {
  title?: string;
  description?: string;
  type?: string;
  size?: string;
  fileKey?: string;
  position?: number;
}
