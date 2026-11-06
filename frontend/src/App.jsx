import {Routes,Route} from 'react-router-dom';
import Layout from './components/Layout.jsx'; import Home from './pages/Home.jsx'; import Explore from './pages/Explore.jsx'; import Categories from './pages/Categories.jsx';
import FoodDetail from './pages/FoodDetail.jsx'; import Checkout from './pages/Checkout.jsx'; import Orders from './pages/Orders.jsx'; import OrderTracking from './pages/OrderTracking.jsx';
import Auth from './pages/Auth.jsx'; import Portfolio from './pages/Portfolio.jsx'; import NotFound from './pages/NotFound.jsx';
export default function App(){return(<Routes><Route element={<Layout/>}>
  <Route index element={<Home/>}/><Route path="foods" element={<Explore/>}/><Route path="popular" element={<Explore popular/>}/><Route path="categories" element={<Categories/>}/>
  <Route path="food/:id" element={<FoodDetail/>}/><Route path="checkout" element={<Checkout/>}/><Route path="orders" element={<Orders/>}/><Route path="orders/:id" element={<OrderTracking/>}/>
  <Route path="login" element={<Auth mode="login"/>}/><Route path="signup" element={<Auth mode="signup"/>}/><Route path="about" element={<Portfolio/>}/><Route path="*" element={<NotFound/>}/></Route></Routes>)}
