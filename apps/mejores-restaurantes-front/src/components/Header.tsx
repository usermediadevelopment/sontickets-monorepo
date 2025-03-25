import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Mejores Restaurantes Logo"
            width={130}
            height={40}
       
          />
   
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="hover:text-gray-600">Inicio</Link>
          <Link href="/restaurantes" className="hover:text-gray-600">Restaurantes</Link>
          <Link href="/categorias" className="hover:text-gray-600">Categorías</Link>
          <Link href="/contacto" className="hover:text-gray-600">Contacto</Link>
        </nav>
      </div>
    </header>
  );
} 