import { AuthForm } from "@/components/authForm/auth-form";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { CgCloseO } from "react-icons/cg";
import logoImg from '@images/logo.png'
export default function Home() {
  return (
    <Fragment>
    <div className="grid grid-cols-1 md:grid-cols-2">
      <div className='p-10'>
        <Link className='flex justify-center md:justify-start' href={"/"}>
        <Image width={50} height={50} src={logoImg} alt='logo'/>
        </Link>

        <div className=' mt-10 md:mt-40 max-w-screen-sm mx-auto'>
          <AuthForm/>
        </div>
 
      </div>

      <div className="h-screen hidden md:block" style={{ backgroundImage: `url("https://i.postimg.cc/Kz12jNJJ/AI-in-the-cloud.jpg")`, backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center' }}>
        <div className='mt-10 text-white space-y-5'>
          <Link href={"/"} className='flex justify-end'>
            <CgCloseO size={50} />
          </Link>
          <div className='text-[40px]  font-bold p-5'>
            <p>Welcome !</p>
            <p>First time, you should login or sign up</p>
          </div>
        </div>
      </div>
    </div>
  </Fragment>
  );
}
