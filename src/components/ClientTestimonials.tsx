import classes from "./ClientTestimonials.module.css";
import Image from "next/image";
interface ReviewProps {
  image: string;
  name: string;
  review: string;
}
function ClientTestimonials({ image, name, review }: ReviewProps) {
  return (
    <div className={classes.ClientTestimonialsPage}>
        <div className={classes.reviewCard}>
          <div className={classes.reviewImage}>
            <Image className={classes.Image} src={image} alt={name} width={500} height={500} />
          </div>
          <b>{name}</b>
          <div className={classes.review_content}>
            <div className={classes.reviewText}>"{review}"</div>
          </div>
        </div>
      </div>
  );
}

export default ClientTestimonials;
