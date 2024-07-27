import React from "react";
import Link from "next/link";

// Import the custom icon components

export function Footer() {
  return (
    <footer className="bg-muted py-6 w-full px-4 md:px-6 border-t mt-auto">
      <div className="container max-w-6xl flex flex-col sm:flex-row justify-between items-center">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="https://drive.google.com/file/d/1UvPmi_8h2RMMlUrbh7Bg_Xc3Eu1Aif79/view?usp=sharing"
            className="text-muted-foreground hover:underline"
            prefetch={false}
          >
            Resume
          </Link>
          <Link
            href="https://krishverma.vercel.app/"
            className="text-muted-foreground hover:underline"
            prefetch={false}
          >
            Portfolio
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">&copy; 2024 Krish Verma</p>
        <div className="flex gap-4 mt-4 sm:mt-0">
          <Link
            href="#"
            className="text-muted-foreground hover:underline"
            prefetch={false}
          >
            <InstagramIcon className="h-5 w-5" />
          </Link>
          <Link
            href="https://www.linkedin.com/in/krish-verma-607408256/"
            className="text-muted-foreground hover:underline"
            prefetch={false}
          >
            <LinkedinIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}

// Icons.js
function InstagramIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function TwitterIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

// You can include the other icon components here as well (MailIcon, PhoneIcon, UserIcon, XIcon)
// if you plan to use them elsewhere in your application.
