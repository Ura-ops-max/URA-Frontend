import ChatBot from '@/components/homepage/ChatBot';
import MarketplaceFeed from '@/components/homepage/MarketPlace';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';



function Home() {
  return (
    <main className="overflow-hidden [--color-primary-foreground:var(--color-white)] [--color-primary:var(--color-green-600)]">
      <section>
        <div className="pb-16 pt-12 md:pb-32 lg:pb-24 lg:pt-44">
          <div className="flex flex-col md:flex-row max-w-6xl mx-auto gap-10 md:gap-24 px-6">
            <div className="text-center lg:text-left flex-1">
              <h1 className="mt-8 max-w-2xl text-balance text-5xl font-medium md:text-6xl lg:mt-16 xl:text-7xl">
                <span className="text-amber-500">Ura</span>, Scale your local Business
              </h1>
              <p className="mt-8 max-w-2xl text-pretty text-lg">
                Connect, Showcase, and Grow your Business in Nigeria’s Vibrant Market Place
                Community
              </p>

              <div className="mt-12 flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-start">
                <Button asChild size="lg" variant="brand" className="px-8 text-base">
                  <Link to="/auth/login">
                    <span className="text-nowrap">Explore Business</span>
                  </Link>
                </Button>
                <Button
                  key={2}
                  asChild
                  size="lg"
                  variant="brandSecondary"
                  className="px-14 text-base"
                >
                  <Link to="/auth/register">
                    <span className="text-nowrap">Join Now</span>
                  </Link>
                </Button>
              </div>
            </div>
            <img
              className="h-56 w-full object-cover sm:h-96 lg:h-max lg:object-contain flex-1"
              src="/heroImg.svg"
              alt="Abstract Object"
            />
          </div>
        </div>
      </section>

      <MarketplaceFeed />
      <ChatBot />
    </main>
  );
}

export default Home;
