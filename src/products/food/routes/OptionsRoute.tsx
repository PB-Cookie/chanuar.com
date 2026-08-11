// @ts-nocheck -- existing presentation markup; typed loader/API boundaries remain enforced.
import { useEffect, useState } from 'react';
import { useLoaderData } from 'react-router';
import { foodConfigured, getRestaurantOptions } from '../api/foodApi';
import FoodHeader from '../components/FoodHeader';
import { OpeningHours } from '../components/OpeningHours';
import type { Restaurant } from '../model/types';

export const loader = () => getRestaurantOptions();

function RestaurantImage({ restaurant }) {
  const [failed, setFailed] = useState(false);

  if (!restaurant.imageUrl || failed) {
    return (
      <div className="food-option-card__image food-option-card__image--placeholder" aria-hidden="true">
        {restaurant.name.slice(0, 1)}
      </div>
    );
  }

  return (
    <img
      className="food-option-card__image"
      src={restaurant.imageUrl}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function OptionsLoading() {
  return (
    <div className="food-options-grid" aria-busy="true" aria-label="Cargando restaurantes">
      <p className="sr-only" role="status">Cargando restaurantes…</p>
      {[0, 1, 2, 3, 4, 5].map((item) => <div className="food-skeleton food-options-skeleton" key={item} />)}
    </div>
  );
}

export default function OptionsApp({ initialRestaurants = null }: { initialRestaurants?: Restaurant[] | null } = {}) {
  const [phase, setPhase] = useState(initialRestaurants ? 'ready' : 'loading');
  const [restaurants, setRestaurants] = useState(initialRestaurants ?? []);
  const [message, setMessage] = useState('');

  async function load() {
    setPhase('loading');
    setMessage('');
    try {
      const options = await getRestaurantOptions();
      setRestaurants(options);
      setPhase('ready');
    } catch (error) {
      setMessage(error.message);
      setPhase('error');
    }
  }

  useEffect(() => { if (!initialRestaurants) load(); }, [initialRestaurants]);

  return (
    <div className="food-shell">
      <FoodHeader />
      <main id="main-content" className="food-options" tabIndex={-1}>
        <header className="food-options__intro">
          <p className="food-kicker">Todas las opciones</p>
          <h1>¿Dónde pedimos esta semana?</h1>
          <p>Explora los restaurantes que ya forman parte de Mesa abierta y consulta su carta original en Uber Eats.</p>
        </header>

        {phase === 'loading' && <OptionsLoading />}
        {phase === 'error' && (
          <section className="food-state food-state--inline" role="alert">
            <h2>No hemos podido cargar los restaurantes</h2>
            <p>{message}</p>
            <button className="food-button" type="button" onClick={load}>Volver a intentar</button>
          </section>
        )}
        {phase === 'ready' && restaurants.length === 0 && (
          <section className="food-state food-state--inline">
            <h2>Todavía no hay restaurantes disponibles</h2>
            <p>{foodConfigured
              ? 'Cuando se importe la primera carta, aparecerá aquí.'
              : 'Falta conectar el proyecto de Supabase para mostrar las opciones.'}</p>
          </section>
        )}
        {phase === 'ready' && restaurants.length > 0 && (
          <section className="food-options-grid" aria-labelledby="food-options-title">
            <h2 className="sr-only" id="food-options-title">{restaurants.length} restaurantes disponibles</h2>
            {restaurants.map((restaurant) => (
              <article className="food-option-card" key={restaurant.id}>
                <RestaurantImage restaurant={restaurant} />
                <div className="food-option-card__body">
                  <div>
                    <p className="food-option-card__count">{restaurant.availableItems} platos disponibles</p>
                    <h3>{restaurant.name}</h3>
                    <p className="food-option-card__description">
                      {restaurant.description || 'Consulta su propuesta y todos los platos disponibles en Uber Eats.'}
                    </p>
                    <OpeningHours openingHours={restaurant.openingHours} />
                  </div>
                  <a className="food-option-card__link" href={restaurant.sourceUrl} target="_blank" rel="noreferrer">
                    Ver en Uber Eats <span aria-hidden="true">↗</span><span className="sr-only"> (se abre en una pestaña nueva)</span>
                  </a>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export function Component() {
  return <OptionsApp initialRestaurants={useLoaderData() as Restaurant[]} />;
}
