import { useForm, SubmitHandler } from 'react-hook-form';
import Button from '../../components/button/Button';
import axios from 'axios';
import { create_heading } from '../../api/config';
import { useNavigate } from 'react-router-dom';

type Inputs = {
    headline: string;
};

function HeadlineForm() {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: { errors },
    } = useForm<Inputs>();

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        console.log(data, 'data');
        axios
            .post(create_heading, data)
            .then((response) => {
                console.log(response);
                navigate('/');
            })
            .catch((err) => {
                console.log(err);
                if (err.response && err.response.status === 400) {
                    setError('headline', {
                        type: 'manual',
                        message: 'Headline already exists!',
                    });
                } else {
                    setError('headline', {
                        type: 'manual',
                        message: 'Something went wrong. Please try again.',
                    });
                }
            });
    };

    return (
        <div className=" flex justify-center items-center flex-col">
            <h2 className="text-2xl font-bold m-8 font-cinzel">Create New Headline</h2>
            <form className="bg-orange-100 flex flex-col p-4 gap-2 w-[34rem] m-auto" onSubmit={handleSubmit(onSubmit)}>
                {/* register your input into the hook by invoking the "register" function */}
                <input className="px-4 py-2" placeholder="headline" {...register('headline', { required: true })} />
                {errors.headline && <span className="text-red-600">{errors.headline.message}</span>}

                <Button text="Submit" />
            </form>
        </div>
    );
}

export default HeadlineForm;
