import { Head } from '@inertiajs/react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

export default function AppLayout({ title, children, noFooter = false }) {
    return (
        <div className="flex min-h-screen flex-col bg-neutral-50">
            <Head title={title} />
            <Navbar />
            <main className="flex-1">{children}</main>
            {!noFooter && <Footer />}
        </div>
    );
}
