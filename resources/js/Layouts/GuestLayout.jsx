import { Head } from '@inertiajs/react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

export default function GuestLayout({ title, children, transparentNav = false }) {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            <Head title={title} />
            <Navbar overlay={transparentNav} />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
