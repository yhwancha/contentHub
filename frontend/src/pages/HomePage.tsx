import { Feed } from '../components/Feed';

export function HomePage() {
  return (
    <div className="container">
      <header className="header">
        <h1>ContentHub</h1>
        <p className="tagline">GeekNews Feed</p>
      </header>
      <main className="main">
        <Feed />
      </main>
    </div>
  );
}
