import { ImageWithFallback } from './figma/ImageWithFallback';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ImageWithFallback
                src="https://via.placeholder.com/32x32?text=KK"
                alt="Kasi Konnect"
                className="h-8 w-auto"
              />
              <span className="text-xl text-gray-800">Kasi Konnect</span>
            </div>
            <p className="text-gray-600 text-sm">
              Empowering Tshwane's business ecosystem through connection and collaboration.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-800 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-500 text-sm transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-500 text-sm transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-500 text-sm transition-colors">
                  Login
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-gray-800 mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-600 text-sm">
                Email: info@kasikonnect.co.za
              </li>
              <li className="text-gray-600 text-sm">
                Phone: +27 12 345 6789
              </li>
              <li className="text-gray-600 text-sm">
                City of Tshwane, Pretoria
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Kasi Konnect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
