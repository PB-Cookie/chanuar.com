import { motion } from 'framer-motion';
function App() {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <h1></h1>
    </motion.div>
  );
}
export default App;
