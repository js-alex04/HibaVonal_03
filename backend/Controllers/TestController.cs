using Microsoft.AspNetCore.Mvc;

namespace HibaVonal_03.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // this means the route will be "api/test" for this controller
    public class TestController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetHelloWorld()
        {
            // Visszaküldünk egy egyszerű JSON objektumot
            return Ok(new { message = "Successful connection between backend and frontend!" });
        }
    }
}