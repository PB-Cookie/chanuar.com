import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
function App() {
  const { t } = useTranslation(['portfolio']);
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <LanguageSwitcher></LanguageSwitcher>
      <h1>{t('contact')}</h1>
    </motion.div>
  );
}
export default App;

// TODO:
import i18n from 'i18next';

function LanguageSwitcher() {
  const changeLanguage = (lng: 'en' | 'es') => {
    i18n.changeLanguage(lng);
  };

  return (
    <select onChange={(e) => changeLanguage(e.target.value as 'en' | 'es')}>
      <option value='en'>English</option>
      <option value='es'>Español</option>
    </select>
  );
}
