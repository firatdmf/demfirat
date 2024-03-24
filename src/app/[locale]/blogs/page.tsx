import classes from "@/app/[locale]/blogs/page.module.css";
function page() {
  return (
    <div className={classes.BlogsPage}>
      <div className={classes.floatRight}>
        <p>
          Muhammed Firat Ozturk <br />
          March 23, 2024
          <br />
          Reading time: 6 min
        </p>
      </div>

      <p>Here is where your blogs will be displayed.</p>
    </div>
  );
}

export default page;
