import Error from "@/components/Error/Error";
import Loader from "@/components/Loader";

interface IErrorGuardProps {
  text: string;
}

export const LoaderGuard = () => {
  return <Loader />;
};

export const ErrorGuard = ({ text }: IErrorGuardProps) => {
  return <Error text={text} />;
};

export const EmptyGuard = ({ text }: IErrorGuardProps) => {
  return <Error errorClass={"empty"} text={text} />;
};
