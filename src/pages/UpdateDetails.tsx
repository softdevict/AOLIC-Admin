import { Button, Input } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

function UpdateDetails() {
       const navigate = useNavigate();
        const {
            register,
            handleSubmit,
            formState: { errors },
          } = useForm<{Contents:string , Links:string}>();
    function createCard(){
        console.log("card sucessafully");
        navigate("/")
    }
  return (
    <div>
         <form 
      style={{
        display: "flex",
            flexDirection: "column",
            maxWidth: "650px",
            marginTop:"5rem"
      }}
      onSubmit={handleSubmit(createCard)}>
      <Input placeholder="Contents" 
      style={{
       
      }}
      {...register('Contents')}
      />
      {}
      <Input placeholder="Links" 
       style={{margin:"20px 0"}}
      {...register('Links')} 
      />
      <Button type="submit"
      style={{backgroundColor:"blue" , color:"white", width:"150px"}}
      >Submit</Button>
    </form>
    </div>
  )
}

export default UpdateDetails
