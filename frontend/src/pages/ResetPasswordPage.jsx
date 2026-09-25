import { Link } from 'react-router-dom';
import { Mail, Phone, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Contact Support Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="bg-brand-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-10 h-10 text-brand" />
            </div>
            <h2 className="text-3xl font-bold text-ink mb-2">Промена Лозинке</h2>
            <p className="text-gray-600">
              Уколико желите да промените лозинку, контактирајте нашу подршку.
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Email Contact */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-brand p-2 rounded-lg">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-ink">Email</h3>
              </div>
              <a
                href="mailto:profesorka.marinalukic@gmail.com"
                className="text-brand hover:text-brand-700 font-semibold transition text-base sm:text-lg break-all"
              >
                profesorka.marinalukic@gmail.com
              </a>
            </div>

            {/* Phone Contact */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-brand p-2 rounded-lg">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-ink">Телефон</h3>
              </div>
              <a
                href="tel:+381604933680"
                className="text-brand hover:text-brand-700 font-semibold transition text-base sm:text-lg break-all"
              >
                0604933680
              </a>
            </div>
          </div>

          {/* Back to Login */}
          <div className="mt-8 pt-6 border-t-2 border-gray-100 text-center">
            <Link
              to="/login"
              className="text-sm text-brand hover:text-brand-700 font-medium inline-flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад на пријаву
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-ink font-medium inline-flex items-center gap-2 transition"
          >
            ← Назад на почетну
          </Link>
        </div>
      </div>
    </div>
  );
}
