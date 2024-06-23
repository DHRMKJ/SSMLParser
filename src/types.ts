export type SSMLAttribute = {
  name: string;
  value: string;
};

export type SSMLTag = {
  name: string;
  children: { [id: string]: SSMLTag };
  id: string;
  attributes: SSMLAttribute[];
  textContent: string;
};
