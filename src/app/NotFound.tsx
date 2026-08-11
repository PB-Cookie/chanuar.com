import { Link } from 'react-router';

export function NotFound() {
  return <main className="not-found"><p>404</p><h1>Esta mesa no está aquí</h1><span>Puede que la dirección haya cambiado o no exista.</span><Link to="/">Volver al inicio</Link></main>;
}
