import { motion } from "framer-motion";

function App() {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <h1>🚧Site is under construction🚧</h1>
      <h2>
        You can check my <a href="https://github.com/PB-Cookie">github</a> on
        the meanwhile
      </h2>
    </motion.div>
  );
}
export default App;
