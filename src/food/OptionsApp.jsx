import { useEffect, useState } from 'react';
import { foodConfigured, getRestaurantOptions } from './api.js';
import FoodHeader from './FoodHeader.jsx';

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
      {[0, 1, 2, 3, 4, 5].map((item) => <div className="food-skeleton food-options-skeleton" key={item} />)}
    </div>
  );
}

export default function OptionsApp() {
  const [phase, setPhase] = useState('loading');
  const [restaurants, setRestaurants] = useState([]);
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

  useEffect(() => { load(); }, []);

  return (
    <div className="food-shell">
      <FoodHeader />
      <main className="food-options">
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
          <section className="food-options-grid" aria-label={`${restaurants.length} restaurantes disponibles`}>
            {restaurants.map((restaurant) => (
              <article className="food-option-card" key={restaurant.id}>
                <RestaurantImage restaurant={restaurant} />
                <div className="food-option-card__body">
                  <div>
                    <p className="food-option-card__count">{restaurant.availableItems} platos disponibles</p>
                    <h2>{restaurant.name}</h2>
                    <p className="food-option-card__description">
                      {restaurant.description || 'Consulta su propuesta y todos los platos disponibles en Uber Eats.'}
                    </p>
                  </div>
                  <a className="food-option-card__link" href={restaurant.sourceUrl} target="_blank" rel="noreferrer">
                    Ver en Uber Eats <span aria-hidden="true">↗</span>
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
