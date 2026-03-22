import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('./routes/home.tsx'),
  route('posts/new', './routes/posts.new.tsx'),
  route('posts/:id', './routes/posts.$id.tsx'),
  route('posts/:id/edit', './routes/posts.$id.edit.tsx'),
] satisfies RouteConfig
