import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import { Globe, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

function Navigation() {
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when clicking outside
  //   useEffect(() => {
  //     function handleClickOutside(event) {
  //       if (
  //         isMenuOpen &&
  //         menuRef.current &&
  //         !menuRef.current.contains(event.target) &&
  //         buttonRef.current &&
  //         !buttonRef.current.contains(event.target)
  //       ) {
  //         setIsMenuOpen(false);
  //       }
  //     }

  //     document.addEventListener("mousedown", handleClickOutside);
  //     return () => {
  //       document.removeEventListener("mousedown", handleClickOutside);
  //     };
  //   }, [isMenuOpen]);

  // Close menu when pressing escape key
  //   useEffect(() => {
  //     function handleEscKey(event) {
  //       if (isMenuOpen && event.key === "Escape") {
  //         setIsMenuOpen(false);
  //       }
  //     }

  //     document.addEventListener("keydown", handleEscKey);
  //     return () => {
  //       document.removeEventListener("keydown", handleEscKey);
  //     };
  //   }, [isMenuOpen]);

  // const count = useSelector((state) => state.counter);

  return (
    <nav className="z-50 bg-black/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 text-white py-3 rounded-full mx-4 my-3 relative">
      <div className="flex items-center space-x-8">
        <Link to="/" className="text-xl font-bold">
          Stayza
        </Link>
        <div className="hidden md:flex space-x-6">
          <Link to={`/`} className="transition-colors text-sm">
            Home
          </Link>
          {/* <p>{count}</p> */}

          {/* {user?.publicMetadata?.role === "admin" && (
            <a href={`/hotels/create`} className="transition-colors text-sm">
              Create Hotel
            </a>
          )} */}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" className="text-xs hidden md:flex">
          <Globe className="h-4 w-4 mr-2" />
          EN
        </Button>
        <SignedOut>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs hidden md:flex"
          >
            <Link to="/sign-in">Log In</Link>
          </Button>
          <Button
            size="sm"
            asChild
            className="bg-white text-black hover:bg-gray-200 text-xs hidden md:flex"
          >
            <Link to="/sign-up">Sign Up</Link>
          </Button>
        </SignedOut>
        {/* <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-xs hidden md:flex"
        >
          <Link to="/sign-in">Log In</Link>
        </Button>
        <Button
          size="sm"
          asChild
          className="bg-white text-black hover:bg-gray-200 text-xs hidden md:flex"
        >
          <Link to="/sign-up">Sign Up</Link>
        </Button> */}
        <SignedIn>
          <UserButton />
          <Button
            size="sm"
            asChild
            className="bg-white text-black hover:bg-gray-200 text-xs hidden md:flex"
          >
            <Link to="/account">My Account</Link>
          </Button>
        </SignedIn>

        {/* Mobile Menu Button */}
        <div className="relative md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="relative z-20"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">
              {isMenuOpen ? "Close menu" : "Open menu"}
            </span>
          </Button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-xl bg-black border border-gray-800 shadow-lg py-2 px-3 animate-in fade-in slide-in-from-top-5 duration-200 z-50"
              style={{ top: "calc(100% + 8px)" }}
            >
              <div className="flex flex-col space-y-3 py-2">
                <a
                  href="/"
                  className="text-sm font-medium hover:text-gray-300 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </a>
                {user?.publicMetadata?.role === "admin" && (
                  <a
                    href="/hotels/create"
                    className="text-sm font-medium hover:text-gray-300 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create Hotel
                  </a>
                )}
                <div className="h-px bg-white/20 my-1"></div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start h-8 px-2"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  EN
                </Button>
                {/* <SignedOut>
                  <a
                    href="/sign-in"
                    className="text-sm font-medium hover:text-gray-300 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log In
                  </a>
                  <Button
                    size="sm"
                    className="bg-white text-black hover:bg-gray-200 w-full mt-2"
                    asChild
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link to="/sign-up">Sign Up</Link>
                  </Button>
                </SignedOut> */}
                <a
                  href="/sign-in"
                  className="text-sm font-medium hover:text-gray-300 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log In
                </a>
                <Button
                  size="sm"
                  className="bg-white text-black hover:bg-gray-200 w-full mt-2"
                  asChild
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/sign-up">Sign Up</Link>
                </Button>
                {/* <SignedIn>
                  <Button
                    size="sm"
                    className="bg-white text-black hover:bg-gray-200 w-full mt-2"
                    asChild
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link to="/account">My Account</Link>
                  </Button>
                </SignedIn> */}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
