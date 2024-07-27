"use client";
import Image from "next/image";
import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";

export function AppleCardsCarouselDemo() {
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return (
    <div className="w-full h-full py-20">
      <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
        Welcome to Restaurant Ordering
      </h2>
      <Carousel items={cards} />
    </div>
  );
}

const DummyContent = () => {
  return (
    <>
      {[...new Array(3).fill(1)].map((_, index) => (
        <div
          key={"dummy-content" + index}
          className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4"
        >
          <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
            <span className="font-bold text-neutral-700 dark:text-neutral-200">
              The first rule of Apple club is that you boast about Apple club.
            </span>{" "}
            Keep a journal, quickly jot down a grocery list, and take amazing
            class notes. Want to convert those notes to text? No problem.
            Langotiya jeetu ka mara hua yaar is ready to capture every thought.
          </p>
          <Image
            src="https://assets.aceternity.com/macbook.png"
            alt="Macbook mockup from Aceternity UI"
            height={500}
            width={500}
            className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain"
          />
          ,
        </div>
      ))}
    </>
  );
};

const GoogleContent = () => {
  return (
    <>
      <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
        <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
          <span className="font-bold text-neutral-700 dark:text-neutral-200">
            We use Firebase for secure authentication and storage (Cloud
            Firestore).
          </span>{" "}
          Never worry about security. Your data is safeguarded with
          state-of-the-art protection measures provided by Google Cloud
          Platform.
        </p>
      </div>
    </>
  );
};

const CRMContent = () => {
  return (
    <>
      <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
        <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
          <span className="font-bold text-neutral-700 dark:text-neutral-200">
            Upcoming Features
          </span>{" "}
          <br />
          Loyalty Program - Customers can sign up to the loyalty program to
          receive points and you can get custom rewards on certain checkpoints.
          <br />
          Customer Trend Tracking - Use Machine Learning to learn customer
          trends and determine dish value.
          <br />
          Sales Tracking - Keep records of bills and tax invoices for regulatory
          purposes, and use the records to generate graphs and relevant
          statistic data
        </p>
      </div>
    </>
  );
};

const FriendContent = () => {
  return (
    <>
      <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
        <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
          <span className="font-bold text-neutral-700 dark:text-neutral-200">
            Ever had to sit down with a calculator on a night out figuring out
            who needs to pay what?
          </span>{" "}
          <br />
          Yeah well, never again!
          <br />
          Your friends can order their own meal, and only pay what they owe.
          <br />
          We auto calculate your split for you, that includes tax!
        </p>
      </div>
    </>
  );
};

const RestContent = () => {
  return (
    <>
      <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
        <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
          <span className="font-bold text-neutral-700 dark:text-neutral-200">
            Welcome
          </span>{" "}
          <br />
          <br />
          Our project is designed to offer a seamless and intuitive experience,
          integrating various advanced features to enhance user engagement and
          efficiency. Here&apos;s what you can expect:
          <br />
          <br />
          <ul className="list-disc pl-5">
            <li>
              <span className="font-semibold">
                Real-time Data Synchronization:
              </span>{" "}
              Enjoy instant updates and smooth interactions with real-time data
              synchronization, ensuring you always have the latest information
              at your fingertips.
            </li>
            <li>
              <span className="font-semibold">Secure Authentication:</span>{" "}
              Powered by Firebase, our platform provides robust security
              features for user authentication and data protection, giving you
              peace of mind.
            </li>
            <li>
              <span className="font-semibold">Dynamic Content Management:</span>{" "}
              Easily manage and update content with a user-friendly interface,
              tailored for efficiency and flexibility.
            </li>
            <li>
              <span className="font-semibold">Customizable Features:</span>{" "}
              Adapt the platform to your needs with a range of customizable
              features that allow you to personalize your experience.
            </li>
            <li>
              <span className="font-semibold">Advanced Analytics:</span> Gain
              insights into user behavior and application performance with
              integrated analytics tools, helping you make informed decisions.
            </li>
          </ul>
          <br />
          Whether you&apos;re looking to streamline your operations or enhance
          user engagement, our platform provides the tools and capabilities you
          need to succeed.
        </p>
      </div>
    </>
  );
};

const TrackContent = () => {
  return (
    <>
      <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
        <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
          <span className="font-bold text-neutral-700 dark:text-neutral-200">
            Restaurant page features
          </span>{" "}
          <br />
          Keep track of your active tables
          <br />
          All your orders with timestamps in one place
          <br />
          Once an order is done, just click mark as done, to let the patrons
          know their food is on their way.
        </p>
      </div>
    </>
  );
};

const HeroContent = () => {
  return (
    <>
      <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
        <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
          <span className="font-bold text-neutral-700 dark:text-neutral-200">
            Welcome to the revolutionized ordering experience!
          </span>{" "}
          <br />
          <br />
          Our project aims to transform the way restaurants handle orders,
          offering a streamlined and modern solution that enhances both
          efficiency and customer satisfaction. Here&apos;s what you can expect:
          <br />
          <br />
          <ul className="list-disc pl-5">
            <li>
              <span className="font-semibold">
                Intuitive Ordering Interface:
              </span>{" "}
              Our platform provides a user-friendly interface that makes it easy
              for customers to place orders.
            </li>
            <li>
              <span className="font-semibold">Real-time Order Updates:</span>{" "}
              Keep your customers informed with real-time updates on their order
              status, reducing wait times and improving the overall dining
              experience.
            </li>
            <li>
              <span className="font-semibold">Seamless Integration:</span> Our
              system integrates seamlessly with your existing POS and kitchen
              display systems, ensuring a smooth and efficient workflow from
              order placement to fulfillment.
            </li>
          </ul>
          <br />
          By adopting our advanced ordering solution, you can elevate your
          restaurant&apos;s service quality, increase operational efficiency,
          and provide an exceptional dining experience that will delight your
          customers and keep them coming back.
        </p>
      </div>
    </>
  );
};

const data = [
  {
    category: "Ordering",
    title: "Revamp your restaurant with a completely new ordering experience",
    src: "https://images.pexels.com/photos/3534750/pexels-photo-3534750.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    content: <HeroContent />,
  },
  {
    category: "Productivity",
    title: "Keep track of what's happening",
    src: "https://images.pexels.com/photos/11322617/pexels-photo-11322617.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: <TrackContent />,
  },
  {
    category: "Product",
    title: "Launching the new Restaurant Ordering App",
    src: "https://images.pexels.com/photos/6612710/pexels-photo-6612710.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    content: <RestContent />,
  },
  {
    category: "Feature",
    title: "Split your bill with friends!",
    src: "https://images.pexels.com/photos/3184188/pexels-photo-3184188.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    content: <FriendContent />,
  },
  {
    category: "Tracking",
    title: "Track your sales with us with our upcoming CRM features",
    src: "https://images.pexels.com/photos/6802048/pexels-photo-6802048.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    content: <CRMContent />,
  },
  {
    category: "Security",
    title: "Supercharged by Google Cloud",
    src: "https://w0.peakpx.com/wallpaper/986/353/HD-wallpaper-google-logo.jpg",
    content: <GoogleContent />,
  },
];
