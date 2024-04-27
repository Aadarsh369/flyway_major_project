import { useState } from "react";
import { Link } from "react-router-dom";

const currentYear = new Date().getFullYear();
const monthsArr = Array.from({ length: 12 }, (x, i) => {
  const month = i + 1;
  return month <= 9 ? "0" + month : month;
});
const yearsArr = Array.from({ length: 9 }, (_x, i) => currentYear + i);

export default function CForm({
  cardMonth,
  cardYear,
  onUpdateState,
  cardNumberRef,
  cardHolderRef,
  cardDateRef,
  onCardInputFocus,
  onCardInputBlur,
  cardCvv,
  children,
}) {
  const [cardNumber, setCardNumber] = useState("");

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    onUpdateState(name, value);
  };

  // TODO: We can improve the regex check with a better approach like in the card component.
  const onCardNumberChange = (event) => {
    let { value, name } = event.target;
    let cardNumber = value;
    value = value.replace(/\D/g, "");
    if (/^3[47]\d{0,13}$/.test(value)) {
      cardNumber = value
        .replace(/(\d{4})/, "$1 ")
        .replace(/(\d{4}) (\d{6})/, "$1 $2 ");
    } else if (/^3(?:0[0-5]|[68]\d)\d{0,11}$/.test(value)) {
      // diner's club, 14 digits
      cardNumber = value
        .replace(/(\d{4})/, "$1 ")
        .replace(/(\d{4}) (\d{6})/, "$1 $2 ");
    } else if (/^\d{0,16}$/.test(value)) {
      // regular cc number, 16 digits
      cardNumber = value
        .replace(/(\d{4})/, "$1 ")
        .replace(/(\d{4}) (\d{4})/, "$1 $2 ")
        .replace(/(\d{4}) (\d{4}) (\d{4})/, "$1 $2 $3 ");
    }

    setCardNumber(cardNumber.trimRight());
    onUpdateState(name, cardNumber);
  };

  const onCvvFocus = () => {
    onUpdateState("isCardFlipped", true);
  };

  const onCvvBlur = () => {
    onUpdateState("isCardFlipped", false);
  };

  return (
    <div className="max-w-2xl m-auto w-full ">
      <div className="-mb-36">{children}</div>
      <form className="pt-44 bg-base-300 md:pb-14 pb-5 px-5 md:px-14 rounded-xl space-y-4">
        <div>
          <label htmlFor="cardNumber" className="block mb-1 font-medium">
            Card Number
          </label>
          <input
            type="tel"
            name="cardNumber"
            className="input w-full"
            autoComplete="off"
            onChange={onCardNumberChange}
            maxLength="19"
            ref={cardNumberRef}
            onFocus={(e) => onCardInputFocus(e, "cardNumber")}
            onBlur={onCardInputBlur}
            value={cardNumber}
          />
        </div>
        <div>
          <label htmlFor="cardName" className="block mb-1 font-medium">
            Card Holder
          </label>
          <input
            type="text"
            className="input w-full"
            autoComplete="off"
            name="cardHolder"
            onChange={handleFormChange}
            ref={cardHolderRef}
            onFocus={(e) => onCardInputFocus(e, "cardHolder")}
            onBlur={onCardInputBlur}
          />
        </div>

        <div className="flex gap-2 justify-between">
          <div className="w-3/4">
            <label htmlFor="cardMonth" className="block mb-1 font-medium">
              Expiration Date
            </label>
            <div className="flex">
              <select
                className="select w-full mr-2"
                value={cardMonth}
                name="cardMonth"
                onChange={handleFormChange}
                ref={cardDateRef}
                onFocus={(e) => onCardInputFocus(e, "cardDate")}
                onBlur={onCardInputBlur}
              >
                <option value="" disabled>
                  Month
                </option>

                {monthsArr.map((val, index) => (
                  <option key={index} value={val}>
                    {val}
                  </option>
                ))}
              </select>
              <select
                name="cardYear"
                className="select w-full"
                value={cardYear}
                onChange={handleFormChange}
                onFocus={(e) => onCardInputFocus(e, "cardDate")}
                onBlur={onCardInputBlur}
              >
                <option value="" disabled>
                  Year
                </option>

                {yearsArr.map((val, index) => (
                  <option key={index} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="w-1/4">
            <label htmlFor="cardCvv" className="block mb-1 font-medium">
              CVV
            </label>
            <input
              type="tel"
              className="input w-full"
              maxLength="4"
              autoComplete="off"
              name="cardCvv"
              onChange={handleFormChange}
              onFocus={onCvvFocus}
              onBlur={onCvvBlur}
              ref={cardCvv}
            />
          </div>
        </div>
        <Link to="/confirmation">
        <input
          type="submit"
          value="Pay Now"
          className="text-center btn w-full btn-outline "
        /></Link>
      </form>
    </div>
  );
}
