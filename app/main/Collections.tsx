'use client'
import { useState } from 'react';
import {Card, CardBody, CardFooter, Image} from "@nextui-org/react";

export default function Collections() {
  const list = [
    {
      title: "Books",
      img: "/fruit-1.jpeg",
    },
    {
      title: "Coins",
      img: "/fruit-2.jpeg",
    },
    {
      title: "Magazines",
      img: "/fruit-3.jpeg",
    },
    {
      title: "Cards",
      img: "/fruit-4.jpeg",
    },
    {
      title: "Postage Stamps",
      img: "/fruit-5.jpeg",
    },
    {
      title: "Caps",
      img: "/fruit-6.jpeg",
    },
    {
      title: "Cars",
      img: "/fruit-7.jpeg",
    },
    {
      title: "Sneakers",
      img: "/fruit-8.jpeg",
    },
  ];

  return (
    <div className="mt-6 gap-3 grid grid-cols-1 sm:grid-cols-4 px-6">
      {list.map((item, index) => (
        <Card shadow="sm" key={index} isPressable onPress={() => console.log("item pressed")}>
          <CardBody className="overflow-visible p-0">
            <Image
              shadow="sm"
              radius="lg"
              width="100%"
              alt={item.title}
              className="w-full object-cover h-[140px]"
              src={item.img}
            />
          </CardBody>
          <CardFooter className="text-small justify-center">
            <b>{item.title}</b>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
