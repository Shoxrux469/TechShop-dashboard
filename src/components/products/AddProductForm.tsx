import { useForm, SubmitHandler } from "react-hook-form";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IProduct, ProductFormValues } from "../../types/product";
import ProductsApi from "../../api/products";
import { getSubcategories, useCategories } from "../../lib/hooks/categories";
import { ICategory } from "../../types/categories";
import { FirestoreTransformer } from "../../utils/transformData";
import FileUpload from "./FileUpload";

const AddProductForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProductFormValues>();
  const queryClient = useQueryClient();

  const { data: categories } = useCategories();

  const subcategories = getSubcategories(categories ?? []);

  const addMutation = useMutation({
    mutationFn: (newProduct: Partial<IProduct>) => {
      const transformedData =
        FirestoreTransformer.toFirestoreFormat(newProduct);
      const response = ProductsApi.addNewProduct(transformedData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test"] });
      console.log("submit happened");
    },
    onError: (error) => {
      console.error("Failed to add product:", error);
    },
  });

  const handleFormSubmit: SubmitHandler<ProductFormValues> = async (
    data: ProductFormValues
  ) => {
    const res = categories
      ?.flatMap((category: ICategory) => category.subcategories)
      .find((subcategory) => subcategory.title === data.category);

    const imageLinks: string[] = [];

    const readFile = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
    };

    const imageFields = [data.image1, data.image2, data.image3];

    console.log(data);

    for (const imageField of imageFields) {
      if (imageField && imageField.length > 0) {
        const imageFiles = Array.from(imageField);
        const imagePromises = imageFiles.map((file) => readFile(file));
        const results = await Promise.all(imagePromises);
        imageLinks.push(...results);
      }
    }

    const newProduct: Partial<IProduct> = {
      title: data.title,
      description: data.description,
      category: {
        id: res?.id ?? "",
        title: res?.title ?? "",
      },
      attributes: {
        color: data.color,
        specific: [data.specific],
      },
      images_links: imageLinks,
      price: data.price,
      quantity: data.quantity,
    };

    addMutation.mutate(newProduct);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="title" className="block mb-1">
            Title
          </label>
          <Input
            {...register("title", { required: "Title is required" })}
            placeholder="Product Title"
            className="w-full"
          />
          {errors.title && (
            <span className="text-red-600 text-sm">{errors.title.message}</span>
          )}
        </div>
        <div className="flex-1">
          <label htmlFor="description" className="block mb-1">
            Description
          </label>
          <Input
            {...register("description", {
              required: "Description is required",
            })}
            placeholder="Product Description"
            className="w-full"
          />
          {errors.description && (
            <span className="text-red-600 text-sm">
              {errors.description.message}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="color" className="block mb-1">
            Color
          </label>
          <Input
            {...register("color")}
            placeholder="Product Color"
            className="w-full"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="specific" className="block mb-1">
            Specific
          </label>
          <Input
            {...register("specific")}
            placeholder="Product Specifics"
            className="w-full"
          />
        </div>
      </div>

      <div className="flex-1">
        <label htmlFor="category" className="block mb-1">
          Category
        </label>
        <Select onValueChange={(value) => setValue("category", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent className="max-h-52 overflow-y-auto">
            {subcategories.map((subcategory) => (
              <SelectItem value={`${subcategory}`}>{subcategory}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-3 gap-2">
        <FileUpload register={register} fieldName="image1" />
        <FileUpload register={register} fieldName="image2" />
        <FileUpload register={register} fieldName="image3" />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="price" className="block mb-1">
            Price
          </label>
          <Input
            type="number"
            {...register("price", { required: "Price is required" })}
            placeholder="Product Price"
            className="w-full"
          />
          {errors.price && (
            <span className="text-red-600">{errors.price.message}</span>
          )}
        </div>
        <div className="flex-1">
          <label htmlFor="quantity" className="block mb-1">
            Quantity
          </label>
          <Input
            type="number"
            {...register("quantity", { required: "Quantity is required" })}
            placeholder="Product Quantity"
            className="w-full"
          />
          {errors.quantity && (
            <span className="text-red-600">{errors.quantity.message}</span>
          )}
        </div>
      </div>

      <Button type="submit" className="mt-4">
        Add Product
      </Button>
    </form>
  );
};

export default AddProductForm;
