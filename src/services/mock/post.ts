export const getAllPosts = async () => {
  const response = await fetch('/mock-data/post.json');
  const posts = await response.json();

  // simulate backend delay
  return new Promise<typeof posts>((resolve) => {
    setTimeout(() => resolve(posts), 500);
  });
};
