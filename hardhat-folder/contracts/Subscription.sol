// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

  
  import "@openzeppelin/contracts/access/Ownable.sol";

 
 

 



contract IERC20 {
  function approve(address spender, uint256 value) public virtual returns (bool) {}
  function transfer(address to, uint256 value) public virtual returns (bool) {}
  function transferFrom(address from, address to, uint256 value) public virtual returns (bool) {}
  function name() public view virtual returns (string memory) {}
  function symbol() public view virtual returns (string memory) {}
  function decimals() public view virtual returns (uint256) {}
  function totalSupply() public view virtual returns (uint256) {}
  function balanceOf(address account) public view virtual returns (uint256) {}
  function allowance(address owner, address spender) public view virtual returns (uint256) {}
}

interface ITierbadges {

  function mint(address _minter, uint256 tokenId ) external;

  function setTokenUri(uint256 tokenId, string memory _uri) external;

  function uriReset() external;

}


contract Subscription is  Ownable {





    event NewSubscription(
    address subscriber,
    address owner,
    uint256 allowance,
    address token,
    string name,
    uint256 selectedPlanId,
    uint256 subscriptionStartingDate

  );

  event SubscriptionCancelled(
    address subscriber,
    address owner
  );


  event MonthlySubscriptionPaid(
    address subscriber,
    address owner,
    uint256 paymentDate,
    uint256 paymentAmount,
    uint256 nextPaymentDate
  );

  event PlanCreated (
    address owner,
    uint256 price,
    uint256 selectedPlanId
    
  );

  event PlanRemoved (
    address owner,
    uint256 selectedPlanId
  );

    event DonationETHReceived(
      address from,
      uint256 amount
      );
    event DonationERC20Received(
      address from,
       uint256 amount,
       address token

    );

  

  uint256 public totalPlans;
  uint256 public planId;
  uint256 public selectedId;
 



  
   
 
 constructor() {
   
   ownerAddress = msg.sender;
     
 }


struct Plan {
        string name;
       uint256 nftTokenId;
        string uri;
        uint256 subscribers;
        uint256 price;
        bool isPlanActive;
    }

struct Subscriber {
        uint256 plan;
        uint256 subscriptionStart;
        uint256 lastPayment;
        bool isActive;
        uint256 payedMonthCounter;
    }

    mapping(uint256 => Plan) public plans;

    mapping (uint256 => string) public _uris;

    mapping(address => Subscriber) public subscribers;

    address public masterAddress = payable(0x664C66ece173898ea923cFA8060e9b0C6EF599aB);
    address public tokenOption1 = payable(0xAb98a637994A2254fc762B7aE78d9b628ED7210A);

    address  public ownerAddress;

    uint256 fee = 8;
    uint256 donationFee = 4;

    modifier correctId(uint id) {
        require(plans[id].isPlanActive, "This subscription plan doesn't exist");
        _;
    }


  function changeParams(address _masterAddress, address _tokenOption ) public onlyOwner{
    masterAddress = _masterAddress;
    tokenOption1 = _tokenOption;
  }
 
   
    function createPlan(string memory _name, string memory _uri, uint256 price, address _nftAddress) public onlyOwner{
     
      require(totalPlans <4, "You can't create subscription plans more than 4");
      require(plans[planId].isPlanActive == false, "This plan exists");

        plans[planId] = Plan(_name,planId,_uri, 0, price,true);
        ITierbadges tierBadges;
        tierBadges = ITierbadges(_nftAddress);

        tierBadges.setTokenUri(planId, _uri);
         totalPlans += 1;
         selectedId = planId;

        emit PlanCreated (msg.sender, price, planId );
        planId += 1;

    }
      
        

       
      
        

  

    function removePlan(uint _id, address _nftAddress) public onlyOwner{
      totalPlans -= 1;
      
      delete plans[_id];
      ITierbadges tierBadges;
      tierBadges = ITierbadges(_nftAddress);
      

      tierBadges.uriReset();
      tierBadges.setTokenUri(_id, "");
      emit PlanRemoved(msg.sender, _id);

    }



function cancelSubscription(address _customer, uint _id, address _token) public  {

  require(msg.sender == _customer || msg.sender == ownerAddress , "You arent the subscriber or the owner!");
  delete subscribers[_customer];
  plans[_id].subscribers -= 1;
  IERC20 tokenInterface;
  tokenInterface = IERC20(_token);
  tokenInterface.approve(address(this),0);
  emit SubscriptionCancelled(_customer, ownerAddress);

}



    function subscribe(address _token, uint256 _id, address nftAddress) public    correctId(_id){
    require(_token == tokenOption1, "This token isn't allowed for payment.");

      IERC20 tokenInterface;
      tokenInterface = IERC20(_token);
      uint256 _subscriptionCost = plans[_id].price ;

      ITierbadges tierBadges;
      tierBadges = ITierbadges(nftAddress);

      require(currentPlan(msg.sender,_id) != true, "Active subscription already exists.");
      require(_subscriptionCost <= tokenInterface.balanceOf(msg.sender), "Insufficient token balance.");

      plans[_id].subscribers += 1;
      subscribers[msg.sender] = Subscriber(_id, block.timestamp,block.timestamp,true,1);

      require((tokenInterface.allowance(msg.sender, address(this)) >= (_subscriptionCost * 12)) && (tokenInterface.allowance(msg.sender, address(this)) <= 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff), "Allowance of (_subscriptionCost * 12) required.");
    
      uint256 feeAmount = (_subscriptionCost/100)*fee ;
      require(tokenInterface.transferFrom(msg.sender, masterAddress, feeAmount), " Subscription payment failed.");

      uint256 newAmount = _subscriptionCost - feeAmount;
      require(tokenInterface.transferFrom(msg.sender, ownerAddress, newAmount), " Subscription payment failed.");
        
        
    tierBadges.mint(msg.sender , _id);
    


        emit NewSubscription(msg.sender, ownerAddress, (_subscriptionCost * 12), _token, plans[_id].name, _id, block.timestamp);
      emit MonthlySubscriptionPaid(msg.sender, ownerAddress, block.timestamp, plans[_id].price, block.timestamp + 30 days);


    }



  


   function withdrawSubscription( address[] memory addresses, address _token) public  {

    for(uint i = 0; i < addresses.length; i++ ){
      require(masterAddress == msg.sender || payable(ownerAddress) == msg.sender, "You are not authorized to execute a subscription payment.");
      require(currentPlan(addresses[i],subscribers[addresses[i]].plan), "Subscription already inactive.");
     if(subscribers[addresses[i]].payedMonthCounter == 12){
       subscribers[addresses[i]].isActive = false;
      } 
     else{
      require(subscriptionPaid(addresses[i]) != true, "Subscription already paid for this period.");
        if(planExist(subscribers[addresses[i]].plan)){
            IERC20 tokenInterface;
            tokenInterface = IERC20(_token);
            uint256 withdrawalAmount = plans[(subscribers[addresses[i]].plan)].price ;

            uint256 feeAmount = (withdrawalAmount/100)*fee ;
            require(tokenInterface.transferFrom(addresses[i], masterAddress, feeAmount), " Subscription payment failed.");

            uint256 newAmount = withdrawalAmount - feeAmount;
            require(tokenInterface.transferFrom(addresses[i], ownerAddress, newAmount), " Subscription payment failed.");
            subscribers[addresses[i]].lastPayment = block.timestamp;
            subscribers[addresses[i]].payedMonthCounter += 1;



            emit MonthlySubscriptionPaid(addresses[i], ownerAddress, block.timestamp, withdrawalAmount, block.timestamp+ 30 days);
          }   
          else{
            continue;
          }

     }
    


    }
    
  }



  


  function withdrawERC20Donations(address _token,uint256 _amount) external onlyOwner payable {
        
        IERC20 tokenInterface;
        tokenInterface = IERC20(_token);

        uint256 currentBalance = tokenInterface.balanceOf(address(this));
        require(_amount <= currentBalance, "Insufficient funds.");
        

        uint256 feeAmount = ((_amount/100)*donationFee);
        require(tokenInterface.transfer(masterAddress, feeAmount),"Withdraw failed");
        uint256 newAmount = _amount - feeAmount;
        require(tokenInterface.transfer(msg.sender, newAmount), "Withdraw failed");

  }



    receive() external payable {
       uint256 feeAmount = ((msg.value/100)*donationFee);
        (bool sent, bytes memory data) = masterAddress.call{value: feeAmount}("");
        require(sent, "Failed to send Ether");
        uint256 newAmount = msg.value - feeAmount;
        
        ( sent, data) = ownerAddress.call{value: newAmount}("");
        require(sent, "Failed to send Ether");

      emit DonationETHReceived(msg.sender,msg.value);
    }

   
    fallback() external payable {
      uint256 feeAmount = ((msg.value/100)*donationFee);
        (bool sent, bytes memory data) = masterAddress.call{value: feeAmount}("");
        require(sent, "Failed to send Ether");
        uint256 newAmount = msg.value - feeAmount;
        
        ( sent, data) = ownerAddress.call{value: newAmount}("");
        require(sent, "Failed to send Ether");
      emit DonationETHReceived(msg.sender,msg.value);

    }

    function planExist(uint256 _id) public view returns(bool) {

      return plans[_id].isPlanActive;

    }




    function currentPlan(address user, uint256 id) public view returns(bool exist) {
       
      

       if(planExist(id)){

         if(subscribers[user].plan == id){

        return subscribers[user].isActive;
         }
       }else{


         return false;

       }
       
    }

 

    function planSubscribers(uint256 id) public correctId(id) view returns(uint) {
        return plans[id].subscribers;
    }

    function planPrice(uint256 id) public correctId(id) view returns(uint) {
        return plans[id].price;
    }


    function erc20Balance(address _token) public view onlyOwner returns (uint){
        IERC20 tokenInterface;
        tokenInterface = IERC20(_token);
        return tokenInterface.balanceOf(address(this));
    }

    function balance() public view onlyOwner returns (uint) {
        return address(this).balance;
    }

    function subscriptionPaid(address _customer) public view returns(bool){
    uint256 remaining = subscribers[_customer].lastPayment + 1 days;
    if(block.timestamp > remaining){
      return false;
    }
    else {
      return true;
    }
  }



}   