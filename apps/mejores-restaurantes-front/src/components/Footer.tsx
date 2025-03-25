import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Mejores Restaurantes</h3>
            <p className="text-gray-400">Descubre los mejores lugares para comer en tu ciudad.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white">Inicio</Link></li>
              <li><Link href="/restaurantes" className="text-gray-400 hover:text-white">Restaurantes</Link></li>
              <li><Link href="/categorias" className="text-gray-400 hover:text-white">Categorías</Link></li>
              <li><Link href="/contacto" className="text-gray-400 hover:text-white">Contacto</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Categorías</h4>
            <ul className="space-y-2">
              <li><Link href="/categoria/italiana" className="text-gray-400 hover:text-white">Italiana</Link></li>
              <li><Link href="/categoria/japonesa" className="text-gray-400 hover:text-white">Japonesa</Link></li>
              <li><Link href="/categoria/peruana" className="text-gray-400 hover:text-white">Peruana</Link></li>
              <li><Link href="/categoria/internacional" className="text-gray-400 hover:text-white">Internacional</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contacto</h4>
            <ul className="space-y-2 text-gray-400">
              <li>info@mejoresrestaurantes.com</li>
              <li>+51 123 456 789</li>
              <li>Lima, Perú</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Mejores Restaurantes. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
} 