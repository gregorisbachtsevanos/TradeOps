import styles from "./Error.module.scss";

interface IErrorProps {
  text: string;
  errorClass?: "error" | "empty";
}

const Error = ({ text, errorClass }: IErrorProps) => {
  return <p className={errorClass ? errorClass : styles.error}>{text}</p>;
};

export default Error;
