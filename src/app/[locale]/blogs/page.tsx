import classes from "@/app/[locale]/blogs/page.module.css";
import { FaSquareXTwitter, FaLinkedin } from "react-icons/fa6";
import { HiOutlineMailOpen } from "react-icons/hi";
import Link from "next/link";
import Image from 'next/image'
function page() {
  return (
    <div className={classes.BlogsPage}>
      <div className={classes.BlogsPageContainer}>
        <div className={classes.col1}>
          <h2>Welcome to Demfirat Blog</h2>
          <p><i>Articles on manufacturing, productivity and efficiency.</i></p>
          
          <div className={classes.blogEntriesContainer}>
            <div className={classes.blogEntry}>
              <div className={classes.blogEntryCoverImage}>
                <Image src='/media/store/store-1.jpeg' alt='alternative' height={500} width={500}></Image>
              </div>
            </div>
            <div className={classes.blogEntry}></div>
            <div className={classes.blogEntry}></div>
            <div className={classes.blogEntry}></div>
            <div className={classes.blogEntry}></div>
            <div className={classes.blogEntry}></div>

          </div>
        </div>
        <div className={classes.col2}>
          <div className={classes.icons}>
            <FaSquareXTwitter /> <FaLinkedin /> <HiOutlineMailOpen />
          </div>
          <h2>RSS FEED</h2>
        </div>
      </div>
    </div>
  );
}

export default page;
