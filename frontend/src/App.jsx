import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import CreateRfp from './pages/CreateRfp';
import RfpDetails from './pages/RfpDetails';
import Vendors from './pages/Vendors';
import Evaluation from './pages/Evaluation';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create-rfp" element={<CreateRfp />} />
          <Route path="/rfp/:id" element={<RfpDetails />} />
          <Route path="/evaluation/:id" element={<Evaluation />} />
          <Route path="/vendors" element={<Vendors />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
