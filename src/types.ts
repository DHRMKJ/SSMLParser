export type SSMLAttribute = {
  name: string;
  value: string;
};

export type SSMLTag = {
  name: string;
  children: SSMLTag[];
  attributes: SSMLAttribute[];
};
