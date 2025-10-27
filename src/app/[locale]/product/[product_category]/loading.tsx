import Spinner from '@/components/Spinner';
import classes from './page.module.css';

export default function Loading() {
  return (
    <div className={classes.loadingContainer}>
      <Spinner />
      <p className={classes.loadingText}>Loading products...</p>
    </div>
  );
}
